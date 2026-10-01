// 临时：打印给定行号所在章号与行内容。用完即删。
import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const heads = [];
lines.forEach((l, i) => { if (/^第[一二三四五六七八九十百零〇\d]+章\s/.test(l.trim())) heads.push(i); });
const chapOf = ln => { let c = 0; for (const h of heads) { if (h <= ln) c++; else break; } return c - 1; };
for (const a of process.argv.slice(2)) {
  const [s, e] = a.split('-').map(Number);
  for (let i = s - 1; i < (e || s); i++) console.log(`L${i + 1} ch${chapOf(i)}: ${(lines[i] || '').trim().slice(0, 160)}`);
}
