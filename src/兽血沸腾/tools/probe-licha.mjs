import fs from 'node:fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
// 他什么时候开始被叫作「李察」？
let n = 0;
for (let i = 0; i < txt.length; i++) {
  if (!txt[i].includes('李察')) continue;
  n++;
  if (n <= 6) console.log(`idx${行到idx(i + 1)} L${i + 1}  ${txt[i].trim().slice(0, 130)}`);
}
console.log(`\n「李察」共 ${n} 行`);
// 李察.震撼.刘 / 震撼.刘 这类自称
for (const w of ['李察.震撼', '李察·震撼', '震撼.刘', '震撼·刘', '我叫李察', '叫李察']) {
  let c = 0, 首 = null;
  for (let i = 0; i < txt.length; i++) if (txt[i].includes(w)) { c++; if (首 === null) 首 = 行到idx(i + 1); }
  console.log(`${w.padEnd(10)} 共 ${c} 行  首现 idx=${首 ?? '无'}`);
}
