import fs from 'node:fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const [名前, ...词s] = process.argv.slice(2);
for (const w of 词s) {
  let c = 0, 首 = null, 首行 = '';
  for (let i = 0; i < txt.length; i++) {
    if (txt[i].includes(名前) && txt[i].includes(w)) { c++; if (首 === null) { 首 = idx(i + 1); 首行 = txt[i].trim().slice(0, 160); } }
  }
  console.log(`${名前}+${w}  共 ${c} 行  首现 idx=${首 ?? '无'}`);
  if (首行) console.log(`    ${首行}`);
}
