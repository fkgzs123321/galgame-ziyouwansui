import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
for (const w of process.argv.slice(2)) {
  let 首 = null, 数 = 0, 文 = '';
  for (let i = 0; i < txt.length; i++) {
    if (!txt[i].includes(w)) continue;
    数++;
    const idx = 行到idx(i + 1);
    if (首 === null || idx < 首) { 首 = idx; 文 = txt[i].trim().slice(0, 120); }
  }
  console.log(`${w.padEnd(12)} 首现 idx=${首 ?? '无'}  共 ${数} 行`);
  if (文) console.log(`   L? ${文}`);
}
