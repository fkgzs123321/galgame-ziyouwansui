// 临时：打印同时包含若干关键词的行（用法：node tmp-xd-and.mjs 词A 词B）。用完即删。
import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const ws = process.argv.slice(2);
let n = 0;
for (let i = 0; i < txt.length; i++) {
  if (!ws.every(w => txt[i].includes(w))) continue;
  n++;
  console.log(`  idx${String(行到idx(i + 1)).padStart(4)} L${i + 1}  ${txt[i].trim().slice(0, 160)}`);
}
console.log(`  共 ${n} 行`);
