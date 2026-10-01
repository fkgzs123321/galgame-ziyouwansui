import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const em = st.entryManifest.NPC;
let noKey = 0, nonSelective = 0, noPos = 0;
const samples = [];
for (const [n, v] of Object.entries(em)) {
  const kw = v.keywords || [];
  if (kw.length === 0) { noKey++; if (noKey <= 5) samples.push(n); }
  if (v.strategy?.type !== 'selective') nonSelective++;
  if (!v.position) noPos++;
}
console.log(`NPC 条目 ${Object.keys(em).length}`);
console.log(`  关键词为空: ${noKey} ${samples.join(', ')}`);
console.log(`  非 selective: ${nonSelective}`);
console.log(`  缺 position: ${noPos}`);
console.log('\n前 3 条详情:');
Object.entries(em).slice(0, 3).forEach(([n, v]) => console.log(`  ${n}: keys=${JSON.stringify(v.keywords)} order=${v.position?.order}`));
// 全局关键词规模
let total = 0;
for (const items of Object.values(st.entryManifest))
  for (const v of Object.values(items)) total += (v.keywords || []).length;
console.log(`\n全卡关键词总数: ${total}`);
// order 分布（确认 configure 重算）
const orders = {};
for (const [t, items] of Object.entries(st.entryManifest))
  for (const v of Object.values(items)) { const k = `${v.position?.type}@${v.position?.order ?? '?'}`; orders[k] = (orders[k] || 0) + 1; }
console.log('order 分布:');
Object.entries(orders).sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([k, c]) => console.log(`  ${k}: ${c}`));
