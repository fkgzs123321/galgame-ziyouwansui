// 临时探针：打印指定 idx 的全部行
import fs from 'node:fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const a = Number(process.argv[2]), b = Number(process.argv[3] ?? process.argv[2]);
for (let i = 0; i < txt.length; i++) {
  const k = idx(i + 1);
  if (k < a || k > b) continue;
  if (txt[i].trim()) console.log(`${k}| ${txt[i].trim()}`);
}
