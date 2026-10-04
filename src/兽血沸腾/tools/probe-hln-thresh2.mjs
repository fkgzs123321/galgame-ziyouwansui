import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) if (c.line <= 行) r = c.idx; return r; }
const 词 = process.argv.slice(2);
for (const w of 词) {
  console.log(`\n════ "${w}"（限含 海伦/列娜/小狐狸 的行）════`);
  let n = 0;
  for (let i = 0; i < txt.length; i++) {
    if (!txt[i].includes(w)) continue;
    if (!/海伦|列娜|小狐狸/.test(txt[i])) continue;
    n++;
    if (n > 14) break;
    console.log(`  idx${String(行到idx(i + 1)).padStart(3)} L${i + 1}  ${txt[i].trim().slice(0, 160)}`);
  }
  console.log(`  命中 ${n} 行`);
}
