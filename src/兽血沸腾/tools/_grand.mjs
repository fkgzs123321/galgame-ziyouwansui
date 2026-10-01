import fs from 'fs';
import path from 'path';
import url from 'url';
const __dir = path.dirname(url.fileURLToPath(import.meta.url));
process.chdir(path.resolve(__dir, '../../..'));
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const ws = process.argv.slice(2);
let c = 0;
for (let i = 0; i < txt.length; i++) {
  if (!ws.every(w => txt[i].includes(w))) continue;
  console.log(`--- idx=${行到idx(i + 1)} L${i + 1} ---`);
  console.log(txt[i].trim());
  if (++c >= 40) break;
}
console.log(`(共 ${c} 行匹配)`);
