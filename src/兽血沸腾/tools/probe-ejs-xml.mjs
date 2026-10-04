import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const EM = st.entryManifest;

let ejsWithXml = [];
let ejsOnly = [];
for (const [type, entries] of Object.entries(EM)) {
  for (const [name, leaf] of Object.entries(entries)) {
    const c0 = leaf.contents?.[0]?.content;
    if (typeof c0 === 'string' && c0.startsWith('@@')) {
      if (c0.includes('<')) ejsWithXml.push({ type, name, c0: c0.slice(0, 130) });
      else ejsOnly.push({ type, name, c0: c0.slice(0, 110) });
    }
  }
}
console.log(`══ contents[0] 以 @@ 开头 且含 XML 标签（${ejsWithXml.length}）══`);
for (const e of ejsWithXml) console.log(`[${e.type}] ${e.name}\n    ${JSON.stringify(e.c0)}`);
console.log(`\n══ contents[0] 以 @@ 开头 无 XML（${ejsOnly.length}）══`);
for (const e of ejsOnly.slice(0, 14)) console.log(`[${e.type}] ${e.name}\n    ${JSON.stringify(e.c0)}`);

// 带 XML 的条目，其 file 首行是什么
console.log('\n══ 所有 part=other 或 XML 条目 → 内容文件首行 ══');
const seen = new Set();
for (const [type, entries] of Object.entries(EM)) {
  for (const [name, leaf] of Object.entries(entries)) {
    const f = leaf.contents?.find?.(x => x.file)?.file;
    if (!f || seen.has(f)) continue;
    if (!leaf.contents?.some?.(x => typeof x.content === 'string' && x.content.includes('<'))) continue;
    seen.add(f);
    try {
      const first = fs.readFileSync('src/兽血沸腾/' + f, 'utf8').split('\n')[0];
      console.log(`${name.padEnd(26)} ${f.padEnd(44)} 首行=${JSON.stringify(first.slice(0, 60))}`);
    } catch { console.log(`${name.padEnd(26)} ${f}  (读不到)`); }
  }
}

// 统计 part 分布
console.log('\n══ 角色 part 分布 ══');
const cnt = {};
for (const leaf of Object.values(EM['角色'] || {})) cnt[leaf.part || '(无)'] = (cnt[leaf.part || '(无)'] || 0) + 1;
console.log(cnt);
console.log('\n══ strategyThresholds.角色 ══');
console.log(JSON.stringify(st.strategyThresholds?.['角色'], null, 2));
console.log('partOrder.角色 =', JSON.stringify(st.partOrder?.['角色']));
