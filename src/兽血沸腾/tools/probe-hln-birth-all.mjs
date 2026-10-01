import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) if (c.line <= 行) r = c.idx; return r; }
// 全篇搜「子嗣/诞下/生下/怀孕/有喜/身孕」，不限人物，按 idx 排序看整体生育时间线
const 子 = /诞下|生下|子嗣|有喜|身孕|怀孕|临盆|分娩/;
const rows = [];
for (let i = 0; i < txt.length; i++) {
  const L = txt[i];
  if (!子.test(L)) continue;
  if (!/海伦|列娜|小狐狸/.test(L)) continue;
  rows.push(`idx${String(行到idx(i + 1)).padStart(3)} L${i + 1}  ${L.trim().slice(0, 165)}`);
}
console.log(`海伦+生育词 共 ${rows.length} 行`);
for (const r of rows) console.log(r);
