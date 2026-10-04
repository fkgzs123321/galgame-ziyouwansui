// 临时：打印关键词的 idx+L+行内容，可限定 idx 范围。用完即删。
// 用法: node tmp-mo-ctx.mjs <词> [fromIdx] [toIdx]
import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const w = process.argv[2];
const from = Number(process.argv[3] ?? -1);
const to = Number(process.argv[4] ?? 9999);
for (let i = 0; i < txt.length; i++) {
  if (!txt[i].includes(w)) continue;
  const idx = 行到idx(i + 1);
  if (idx < from || idx > to) continue;
  console.log(`idx${String(idx).padStart(3)} L${i + 1}  ${txt[i].trim().slice(0, 220)}`);
}
