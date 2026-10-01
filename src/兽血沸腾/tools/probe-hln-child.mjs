import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) if (c.line <= 行) r = c.idx; return r; }
const 词 = /怀孕|身孕|有喜|临盆|生产|分娩|生子|孩子|儿子|女儿|子嗣|血脉/;
let n = 0;
for (let i = 0; i < txt.length; i++) {
  const L = txt[i];
  if (!/海伦|列娜|小狐狸/.test(L)) continue;
  if (!词.test(L)) continue;
  n++;
  if (n > 30) break;
  console.log(`idx${String(行到idx(i + 1)).padStart(3)} L${i + 1}  ${L.trim().slice(0, 165)}`);
}
console.log(`\n命中 ${n} 行`);
