// 临时：打印某 idx 区间内的正文行。用完即删。
// 用法: node tmp-mo-range.mjs <fromIdx> <toIdx> [关键词]
import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const from = Number(process.argv[2]);
const to = Number(process.argv[3]);
const kw = process.argv[4] ?? '';
let started = false;
for (let i = 0; i < txt.length; i++) {
  const idx = 行到idx(i + 1);
  if (idx < from) continue;
  if (idx > to) break;
  started = true;
  const t = txt[i].trim();
  if (!t) continue;
  if (kw && !t.includes(kw)) continue;
  console.log(`idx${String(idx).padStart(3)} L${i + 1}  ${t.slice(0, 300)}`);
}
