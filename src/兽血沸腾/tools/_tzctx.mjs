// 临时探针：打印含某词的行的 idx（可限定 idx 区间）
import fs from 'node:fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const [w, lo = '0', hi = '9999'] = process.argv.slice(2);
const a = Number(lo), b = Number(hi);
let n = 0;
for (let i = 0; i < txt.length; i++) {
  if (!txt[i].includes(w)) continue;
  const k = idx(i + 1);
  if (k < a || k > b) continue;
  n++;
  console.log(`idx=${k} L${i + 1}  ${txt[i].trim().slice(0, 200)}`);
  if (n >= 12) break;
}
console.log(`共 ${n} 行（区间 ${a}~${b}）`);
