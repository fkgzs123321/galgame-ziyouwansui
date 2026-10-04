// 临时探针：按 idx 区间 + 关键词导出原文行。用完即删。
import fs from 'node:fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
const idx = l => { let r = 0; for (const c of ci) { if (c.line <= l) r = c.idx; else break; } return r; };
const lo = Number(process.argv[2]), hi = Number(process.argv[3]);
const parse = s => (s || '').split('|').filter(w => w && w !== '*');
const words = parse(process.argv[4]);
const who = parse(process.argv[5]);
const out = [];
for (let i = 0; i < txt.length; i++) {
  const k = idx(i + 1);
  if (k < lo || k > hi) continue;
  const t = txt[i];
  if (words.length && !words.some(w => t.includes(w))) continue;
  if (who.length && !who.some(w => t.includes(w))) continue;
  out.push(`idx=${k} :: ${t.trim().slice(0, 320)}`);
}
console.log(`---- ${lo}-${hi} [${words}] [${who}] 共 ${out.length}`);
console.log(out.slice(0, Number(process.argv[6] || 60)).join('\n'));
