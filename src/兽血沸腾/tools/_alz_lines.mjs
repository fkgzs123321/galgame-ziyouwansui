// 临时探针：列出同时含全部关键词的行与所属 idx（作业用，用完删除）
import fs from 'node:fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
const [limitS, ...words] = process.argv.slice(2);
const limit = Number(limitS);
const hits = [];
for (let i = 0; i < txt.length; i++) {
  if (!words.every(w => txt[i].includes(w))) continue;
  hits.push(`[idx=${idx(i + 1)}] L${i + 1} ${txt[i].trim().slice(0, 150)}`);
}
console.log(`命中 ${hits.length} 行（关键词 ${words.join(' + ')}）`);
for (const h of hits.slice(0, limit)) console.log(h);
if (hits.length > limit) console.log(`… 其余 ${hits.length - limit} 行省略`);
