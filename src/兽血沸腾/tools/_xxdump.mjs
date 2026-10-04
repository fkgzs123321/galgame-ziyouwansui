// 临时：按 idx 区间打印原文（用完即删）。node _xxdump.mjs 197 197
import fs from 'node:fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const [a, b, w] = process.argv.slice(2);
for (let i = 0; i < txt.length; i++) {
  const idx = 行到idx(i + 1);
  if (idx < Number(a) || idx > Number(b)) continue;
  if (w && !txt[i].includes(w)) continue;
  console.log(`idx${String(idx).padStart(3)} L${i + 1}  ${txt[i].trim()}`);
}
