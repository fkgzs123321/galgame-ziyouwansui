import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) if (c.line <= 行) r = c.idx; return r; }
// 找出 含<名> 且 含<语> 的最早 idx
const 名 = process.argv[2];
const 语 = new RegExp(process.argv[3]);
const 排 = process.argv[4] ? new RegExp(process.argv[4]) : null;
const hits = [];
for (let i = 0; i < txt.length; i++) {
  const L = txt[i];
  if (!L.includes(名)) continue;
  if (!语.test(L)) continue;
  if (排 && !排.test(L)) continue;
  hits.push([行到idx(i + 1), i + 1, L.trim()]);
}
hits.sort((a, b) => a[0] - b[0]);
console.log(`「${名}」+ ${语} 共 ${hits.length} 行，最早 5 条：`);
for (const [idx, L, t] of hits.slice(0, 5)) console.log(`  idx${String(idx).padStart(3)} L${L}  ${t.slice(0, 165)}`);
