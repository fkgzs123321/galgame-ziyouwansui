import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const roles = st.entryManifest['角色'];

const rows = Object.entries(roles).map(([k, v]) => [k, v.part ?? '-', v.position?.order ?? null, v.strategy?.type ?? '-']);
rows.sort((a, b) => (a[2] ?? 1e9) - (b[2] ?? 1e9));
console.log('条目'.padEnd(30) + 'part'.padEnd(14) + 'order'.padEnd(8) + 'strategy');
for (const [k, p, o, s] of rows) console.log(`  ${k.padEnd(28)} ${p.padEnd(12)} ${String(o).padEnd(6)} ${s}`);

const NEED = ['黛丝', '若尔娜', '崔蓓茜', '歌坦妮', '果果', '壹条', '安度兰长老', '茉儿'];
console.log('\n══ 待补角色的邻居 order ══');
for (const n of NEED) {
  for (const [k, , o] of rows) if (k.startsWith(n)) console.log(`  ${k.padEnd(28)} order=${o}`);
}
