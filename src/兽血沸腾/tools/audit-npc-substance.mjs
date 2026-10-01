import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');

const rows = [];
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml')).sort()) {
  const lines = fs.readFileSync(path.join(NPC, f), 'utf8').split('\n');
  let inM = false;
  for (const l of lines) {
    if (/^  成员:\s*$/.test(l)) { inM = true; continue; }
    if (!inM) continue;
    const m = l.match(/^    ([^#\s][^:]*):\s*$/);
    if (!m) continue;
    const n = m[1];
    const cnt = n.length >= 2 ? txt.split(n).length - 1 : 0;
    rows.push({ f, n, cnt });
  }
}
rows.sort((a, b) => b.cnt - a.cnt);
const buckets = [[100, '≥100 次'], [30, '30-99'], [10, '10-29'], [3, '3-9'], [0, '0-2']];
console.log('══ 群像成员在原文的提及次数分布 ══');
for (const [lo, label] of buckets) {
  const hi = lo === 100 ? Infinity : buckets[buckets.findIndex(b => b[0] === lo) - 1][0];
  const sel = rows.filter(r => r.cnt >= lo && r.cnt < hi);
  console.log(`  ${label.padEnd(9)} ${String(sel.length).padStart(3)} 人`);
}
console.log(`\n合计 ${rows.length} 人`);
console.log('\n══ 提及 ≥30 次的成员（够格独立成条） ══');
for (const r of rows.filter(r => r.cnt >= 30)) console.log(`  ${String(r.cnt).padStart(5)}  ${r.n.padEnd(14)} (${r.f.replace('.yaml','')})`);
console.log('\n══ 提及 0-2 次的成员（近乎一次性角色） ══');
const zero = rows.filter(r => r.cnt <= 2);
console.log(`  ${zero.length} 人: ${zero.map(r => r.n).join('、')}`);
