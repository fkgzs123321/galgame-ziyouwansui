import fs from 'node:fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
function 行到idx(n) { return idx(n); }
const mode = process.argv[2];
if (mode === 'idx') {
  // print lines whose idx range matches, with word filter optional
  const lo = Number(process.argv[3]), hi = Number(process.argv[4]);
  const w = process.argv[5] ?? '';
  for (let i = 0; i < txt.length; i++) {
    const k = 行到idx(i + 1);
    if (k >= lo && k <= hi && txt[i].includes(w)) console.log(`[${k}] ${txt[i].trim().slice(0, 200)}`);
  }
} else if (mode === 'word') {
  const w = process.argv[3];
  const lo = Number(process.argv[4] ?? 0), hi = Number(process.argv[5] ?? 99999);
  for (let i = 0; i < txt.length; i++) {
    const k = 行到idx(i + 1);
    if (k >= lo && k <= hi && txt[i].includes(w)) console.log(`[${k}] ${txt[i].trim().slice(0, 200)}`);
  }
}
