// 临时探针：按 idx 顺序打印含某词的行（idx + 行号 + 前 N 字）
import fs from 'node:fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const 词 = process.argv[2];
const 长 = Number(process.argv[3] ?? 90);
for (let i = 0; i < txt.length; i++) {
  if (!txt[i].includes(词)) continue;
  console.log(`idx=${idx(i + 1)} L${i + 1} ${txt[i].trim().slice(0, 长)}`);
}
