// 临时：按 idx 区间打印原文
import fs from 'node:fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const lo = Number(process.argv[2]), hi = Number(process.argv[3]);
const kw = process.argv[4];
for (let i = 0; i < txt.length; i++) {
  const k = idx(i + 1);
  if (k < lo || k > hi) continue;
  const line = txt[i].trim();
  if (!line) continue;
  if (kw && !line.includes(kw)) continue;
  console.log(`${k}| ${line.slice(0, 400)}`);
}
