import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const show = (a, b, tag) => {
  console.log(`\n══ ${tag} (L${a}-${b}) ══`);
  for (let i = a; i <= b; i++) console.log(`L${i}: ${lines[i - 1].trim().slice(0, 200)}`);
};
// 谁是小净的师父？谁戴斗笠？
for (const kw of ['小净', '九环锡杖', '五殿下', '四殿下', '壮汉殿下', '玄奥']) {
  const h = [];
  lines.forEach((l, i) => { if (l.includes(kw)) h.push(i + 1); });
  console.log(`\n【${kw}】${h.length} 行 → ${h.slice(0, 12).join(', ')}`);
}
show(99206, 99230, '斗笠+锡杖+小净 归属');
show(99276, 99288, '五殿下自报冬五');
