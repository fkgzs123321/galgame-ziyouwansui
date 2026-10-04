// 临时：列出某词的全部出现 idx（升序）与行文
import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const w = process.argv[2];
const limit = Number(process.argv[3] ?? 40);
let n = 0;
for (let i = 0; i < txt.length; i++) {
  if (!txt[i].includes(w)) continue;
  n++;
  if (n > limit) break;
  console.log(`[${n}] L${i + 1} idx=${行到idx(i + 1)}  ${txt[i].trim().slice(0, 160)}`);
}
console.log(`共 ${n}${n > limit ? '+' : ''} 行`);
