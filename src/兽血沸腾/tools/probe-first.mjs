import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) if (c.line <= 行) r = c.idx; return r; }
const 词 = process.argv.slice(2);
for (const w of 词) {
  let first = null, n = 0, 行集 = [];
  for (let i = 0; i < txt.length; i++) {
    if (!txt[i].includes(w)) continue;
    n++; if (first === null) first = i + 1;
    if (行集.length < 5) 行集.push(i + 1);
  }
  console.log(`\n${w}: 命中 ${n} 行，首现行 L${first} → idx${first ? 行到idx(first) : '?'}`);
  for (const L of 行集) console.log(`    idx${String(行到idx(L)).padStart(3)} L${L}  ${txt[L - 1].trim().slice(0, 130)}`);
}
