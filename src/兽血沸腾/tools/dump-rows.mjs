import fs from 'fs';
const rows = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/npc-rows.json', 'utf8'));
console.log('rows 字段:', Object.keys(rows[0]).join(', '));
console.log('样例:', JSON.stringify(rows[0], null, 2).slice(0, 500));
const gs = {};
for (const r of rows) (gs[r.g] ||= []).push(r.n);
console.log('\n各组人数:');
for (const [g, ns] of Object.entries(gs)) console.log(`  ${g}: ${ns.length}`);
console.log('\n合计', rows.length);
