import fs from 'fs';
import path from 'path';
import url from 'url';
const __dir = path.dirname(url.fileURLToPath(import.meta.url));
process.chdir(path.resolve(__dir, '../../..'));
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const lo = Number(process.argv[2]), hi = Number(process.argv[3]);
const kw = process.argv[4];
let on = false;
for (let i = 0; i < txt.length; i++) {
  const idx = 行到idx(i + 1);
  if (idx < lo) continue;
  if (idx > hi) break;
  if (kw && !txt[i].includes(kw)) continue;
  console.log(`[${idx}] ${txt[i].trim()}`);
}
