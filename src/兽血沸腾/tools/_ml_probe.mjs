// 临时探针：列某词在指定 idx 区间内的所有出现（含上下文），供梦露分档核阈值用。
import fs from 'node:fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const 词 = process.argv[2];
const lo = Number(process.argv[3] ?? 0);
const hi = Number(process.argv[4] ?? 9999);
let n = 0;
for (let i = 0; i < txt.length; i++) {
  if (!txt[i].includes(词)) continue;
  const k = idx(i + 1);
  if (k < lo || k > hi) continue;
  n++;
  console.log(`[idx=${k}] ${txt[i].trim().slice(0, 200)}`);
}
console.log(`── ${词} 在 idx ${lo}~${hi} 内共 ${n} 行`);
