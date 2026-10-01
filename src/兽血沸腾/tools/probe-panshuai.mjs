import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const show = (kw, n = 6) => {
  const h = [];
  lines.forEach((l, i) => { if (l.includes(kw)) h.push(i + 1); });
  console.log(`\n【${kw}】${h.length} 行 → ${h.slice(0, 10).join(', ')}`);
  h.slice(0, n).forEach(i => console.log(`   L${i}: ${lines[i - 1].trim().slice(0, 170)}`));
};
show('潘帅');
show('古德');
show('四殿下');
show('唐藏亲王', 8);
