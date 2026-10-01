import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) if (c.line <= 行) r = c.idx; return r; }
const 词 = new RegExp(process.argv[2]);
const neo = Number(process.argv[3] ?? 0);
const 同 = process.argv[4] ? new RegExp(process.argv[4]) : null;
let n = 0;
for (let i = 0; i < txt.length; i++) {
  const idx = 行到idx(i + 1);
  if (idx < neo) continue;
  const L = txt[i];
  if (!词.test(L)) continue;
  if (同 && !同.test(L)) continue;
  n++;
  if (n > 40) break;
  console.log(`idx${String(idx).padStart(3)} L${i + 1}  ${L.trim().slice(0, 175)}`);
}
console.log(`\n命中 ${n} 行`);
