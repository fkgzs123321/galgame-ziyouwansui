import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
for (const w of process.argv.slice(2)) {
  const hits = [];
  for (let i = 0; i < txt.length; i++) if (txt[i].includes(w)) hits.push([行到idx(i + 1), i + 1, txt[i].trim()]);
  console.log(`\n════ ${w}  共 ${hits.length} 行 ════`);
  for (const [idx, L, t] of hits.slice(-6)) console.log(`  idx${String(idx).padStart(3)} L${L}  ${t.slice(0, 150)}`);
}
