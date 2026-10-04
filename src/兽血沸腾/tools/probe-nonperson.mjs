import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
for (const kw of ['死神印记', '口水怪', '谭雅', '珊瑚美人']) {
  const h = [];
  lines.forEach((l, i) => { if (l.includes(kw)) h.push(i + 1); });
  console.log(`\n【${kw}】${h.length} 行 → ${h.slice(0, 6).join(', ')}`);
  h.slice(0, 3).forEach(i => console.log(`   L${i}: ${lines[i - 1].trim().slice(0, 165)}`));
}
