import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
for (const n of ['唐藏亲王', '冬五']) {
  const h = [];
  lines.forEach((l, i) => { if (l.includes(n)) h.push(i + 1); });
  console.log(`\n══ ${n} (${h.length} 行) ══`);
  h.slice(0, 12).forEach(i => console.log(`  L${i}: ${lines[i - 1].trim().slice(0, 175)}`));
}
// 外貌关键词定位
console.log('\n══ 斗笠 / 光头 / 唇红齿白 与唐藏亲王同段 ══');
for (const kw of ['斗笠', '锡杖', '唇红齿白']) {
  const h = [];
  lines.forEach((l, i) => { if (l.includes(kw)) h.push(i + 1); });
  console.log(`  ${kw}: ${h.length} 行 → ${h.slice(0, 6).join(', ')}`);
}
