import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) if (c.line <= 行) r = c.idx; return r; }
const lo = Number(process.argv[2] ?? 0);
const 词 = /海伦/;
const 子 = /生下|诞下|分娩|生了|临盆|怀了|有喜|身孕|孩子出生|长子|长女|为他生/;
let n = 0;
for (let i = 0; i < txt.length; i++) {
  const L = txt[i];
  const idx = 行到idx(i + 1);
  if (idx < lo) continue;
  if (!词.test(L) || !子.test(L)) continue;
  n++;
  if (n > 30) break;
  console.log(`idx${String(idx).padStart(3)} L${i + 1}  ${L.trim().slice(0, 170)}`);
}
console.log(`\nidx>=${lo} 命中 ${n} 行`);
