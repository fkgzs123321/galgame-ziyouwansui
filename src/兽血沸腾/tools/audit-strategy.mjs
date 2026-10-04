import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

const em = st.entryManifest;
let tot = 0, en = 0, dis = 0;
const pos = {}, strat = {}, depth = {}, byType = {};
const noKw = [], badDepth = [];

for (const [type, entries] of Object.entries(em)) {
  for (const [name, leaf] of Object.entries(entries)) {
    tot++; byType[type] = (byType[type] ?? 0) + 1;
    if (leaf.enabled === false) { dis++; continue; }
    en++;
    const p = String(leaf.position?.type ?? '(无)');
    pos[p] = (pos[p] ?? 0) + 1;
    strat[leaf.strategy?.type ?? '(无)'] = (strat[leaf.strategy?.type ?? '(无)'] ?? 0) + 1;
    if (p === 'at_depth') {
      const d = leaf.position?.depth ?? 0;
      depth[d] = (depth[d] ?? 0) + 1;
      if (d >= 1) badDepth.push(`${type}/${name} depth=${d}`);
    }
    if (leaf.strategy?.type === 'selective' && !(leaf.keywords ?? []).length) noKw.push(`${type}/${name}`);
  }
}

console.log('══ 总数 ══');
console.log(`  注册 ${tot}  启用 ${en}  停用 ${dis}`);
console.log('\n══ 类型分布 ══');
for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(6)} ${v}`);
console.log('\n══ position ══');
for (const [k, v] of Object.entries(pos)) console.log(`  ${k.padEnd(20)} ${v}`);
console.log('\n══ strategy ══');
for (const [k, v] of Object.entries(strat)) console.log(`  ${k.padEnd(12)} ${v}`);
console.log('\n══ at_depth 深度分布 ══');
for (const [k, v] of Object.entries(depth)) console.log(`  depth=${k}  ${v}`);

console.log('\n══ 铁律检查 ══');
console.log(`  depth>=1 违规: ${badDepth.length} 处` + (badDepth.length ? '\n    ' + badDepth.join('\n    ') : ''));
console.log(`  selective 无 keywords: ${noKw.length} 处` + (noKw.length ? '\n    ' + noKw.join('\n    ') : ''));
