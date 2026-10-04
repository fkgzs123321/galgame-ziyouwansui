import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));

// 行号 -> idx（章节序号）
function 行到idx(行) {
  let lo = 0, hi = ci.length - 1, r = 0;
  for (const c of ci) if (c.line <= 行) r = c.idx;
  return r;
}

const 词 = process.argv.slice(2);
for (const w of 词) {
  console.log(`\n════ "${w}" ════`);
  let n = 0;
  for (let i = 0; i < txt.length; i++) {
    if (!txt[i].includes(w)) continue;
    // 只打印与海伦/列娜同行的
    if (!/海伦|列娜/.test(txt[i])) continue;
    n++;
    if (n > 25) break;
    console.log(`  idx${String(行到idx(i + 1)).padStart(3)} L${i + 1}  ${txt[i].trim().slice(0, 150)}`);
  }
  console.log(`  命中 ${n} 行（与海伦同行）`);
}
