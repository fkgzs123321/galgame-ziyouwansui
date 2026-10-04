// 只读：核实 崔蓓茜 / 谭雅 两个锚点差异，并抽查纪元表分布。
import fs from 'fs';

const raw = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const pairs = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/line-to-idx.json', 'utf8'));
const idxForLine = ln => { let cur = -1; for (const p of pairs) { if (p.line <= ln) cur = p.idx; else break; } return cur; };

const 段 = (ln, n = 1) => raw.slice(ln - 1, ln - 1 + n).join('\n').trim();

console.log('══ 崔蓓茜 首现 L2546 全文（截 600 字）══');
console.log(段(2546).slice(0, 600));
console.log(`\n→ idx=${idxForLine(2546)}`);

console.log('\n══ 含「崔蓓茜」的最早 3 行 ══');
let c = 0;
for (let i = 2540; i < 8000 && c < 3; i++) {
  if (raw[i].includes('崔蓓茜')) { console.log(`  L${i + 1} idx=${idxForLine(i + 1)} :: ${raw[i].trim().slice(0, 120)}`); c++; }
}

console.log('\n══ 「珊瑚美人」出现位置（前 8 次）══');
c = 0;
for (let i = 0; i < raw.length && c < 8; i++) {
  if (raw[i].includes('珊瑚美人')) { console.log(`  L${i + 1} idx=${idxForLine(i + 1)} :: ${raw[i].trim().slice(0, 130)}`); c++; }
}

console.log('\n══ 「谭雅」出现位置（前 8 次）══');
c = 0;
for (let i = 0; i < raw.length && c < 8; i++) {
  if (raw[i].includes('谭雅')) { console.log(`  L${i + 1} idx=${idxForLine(i + 1)} :: ${raw[i].trim().slice(0, 130)}`); c++; }
}

console.log('\n══ 「谭雅」与「珊瑚美人」同段共现的行 ══');
c = 0;
for (let i = 0; i < raw.length && c < 6; i++) {
  if (raw[i].includes('谭雅') && raw[i].includes('珊瑚')) { console.log(`  L${i + 1} idx=${idxForLine(i + 1)} :: ${raw[i].trim().slice(0, 200)}`); c++; }
}
