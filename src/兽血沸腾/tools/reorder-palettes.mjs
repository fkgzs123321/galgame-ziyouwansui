import fs from 'fs';
const STATE = 'src/兽血沸腾/tavern-cards-state.json';
const st = JSON.parse(fs.readFileSync(STATE, 'utf8'));
const roles = st.entryManifest['角色'];

// 目标顺序：每条 _性格调色盘 紧跟同角色的 _基础信息（隆美尔/李察王子 紧跟 _三面性）
const ANCHOR = {
  '黛丝_性格调色盘': '黛丝_基础信息',
  '若尔娜_性格调色盘': '若尔娜_基础信息',
  '崔蓓茜_性格调色盘': '崔蓓茜_基础信息',
  '歌坦妮_性格调色盘': '歌坦妮_基础信息',
  '果果_性格调色盘': '果果_基础信息',
  '壹条_性格调色盘': '壹条_基础信息',
  '安度兰长老_性格调色盘': '安度兰长老_基础信息',
  '茉儿_性格调色盘': '茉儿_基础信息',
  '隆美尔_性格调色盘': '隆美尔_三面性',
  '李察王子_性格调色盘': '李察王子_三面性',
};

const before = Object.keys(roles);
const pend = new Map(Object.entries(ANCHOR));
const out = {};
for (const k of before) {
  if (pend.has(k)) continue; // 先移除，稍后就地插入
  out[k] = roles[k];
  for (const [newKey, anchor] of pend) {
    if (anchor === k) { out[newKey] = roles[newKey]; pend.delete(newKey); }
  }
}
if (pend.size) { console.error('未找到锚点:', [...pend.keys()]); process.exit(1); }
if (JSON.stringify(Object.keys(out).sort()) !== JSON.stringify(before.slice().sort())) {
  console.error('键集合发生变化，中止'); process.exit(1);
}

st.entryManifest['角色'] = out;
fs.writeFileSync(STATE, JSON.stringify(st, null, 2), 'utf8');

const after = Object.keys(out);
console.log(`角色 manifest: ${before.length} -> ${after.length} 条`);
console.log('\n顺序变更处：');
after.forEach((k, i) => {
  if (k.includes('性格调色盘') || k.includes('基础信息')) {
    const oldI = before.indexOf(k);
    const mark = oldI === i ? '   ' : ` ← 原 ${oldI}`;
    console.log(`  ${String(i).padStart(3)} ${k.padEnd(24)}${mark}`);
  }
});
