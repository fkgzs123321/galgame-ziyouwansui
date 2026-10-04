// 只读：确认 私密 / 私密阶段 的注册形状，以及各条目归属的角色目录 → 登场章。
import fs from 'fs';

const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));
const M = st.entryManifest.角色;

console.log('══ 私密 / 私密阶段 / 三面性 / 二次解释 样例 ══');
for (const 后缀 of ['_私密', '_私密阶段', '_三面性', '_二次解释']) {
  const k = Object.keys(M).find(x => x.endsWith(后缀));
  if (!k) { console.log(`  ${后缀}: 无`); continue; }
  const v = M[k];
  console.log(`\n── ${k} ──  注册=${v.contents ? 'contents' : 'path'}`);
  console.log('   ' + JSON.stringify({ part: v.part, scope: v.scope, keywords: v.keywords, position: v.position }));
  if (v.contents) v.contents.forEach((c, i) => console.log(`   contents[${i}]: ${c.content ? 'content=' + JSON.stringify(c.content) : 'file=' + c.file}`));
  else console.log(`   path=${v.path}`);
  const f = v.path || (v.contents || []).find(c => c.file)?.file;
  if (f && fs.existsSync(`${PROJ}/${f}`)) fs.readFileSync(`${PROJ}/${f}`, 'utf8').split('\n').slice(0, 2).forEach((x, i) => console.log(`      磁盘[${i + 1}] ${x}`));
}

// 角色目录 → 登场
const era = JSON.parse(fs.readFileSync(`${PROJ}/tools/era-table.json`, 'utf8'));
const 登 = new Map(era.表.map(x => [x.类型 + '/' + x.名, x]));
console.log('\n══ 每个角色目录的条目数 + 登场章 ══');
let 无登场 = [];
const 目录 = new Map();
for (const [k, v] of Object.entries(M)) {
  const ps = [v.path, ...(v.contents || []).map(c => c.file)].filter(Boolean);
  for (const p of ps) {
    const m = String(p).match(/^世界书\/角色\/([^/]+)\//);
    if (m) 目录.set(m[1], (目录.get(m[1]) || 0) + 1);
  }
}
console.log(`   角色目录 ${目录.size} 个，条目合计 ${[...目录.values()].reduce((a, b) => a + b, 0)}`);
for (const [d, n] of 目录) if (!登.has('角色/' + d)) 无登场.push(d);
console.log(`   纪元表缺登场的角色目录: ${无登场.length ? 无登场.join('、') : '无'}`);
const 缺NPC = Object.values(st.entryManifest.NPC).length - era.表.filter(x => x.类型 === 'NPC').length;
console.log(`   纪元表 NPC 覆盖: ${era.表.filter(x => x.类型 === 'NPC').length} / ${Object.keys(st.entryManifest.NPC).length}`);
