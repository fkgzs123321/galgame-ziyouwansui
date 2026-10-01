// 临时：给定词，打印首现行/章与该词总处数。用完即删。
import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const heads = [];
lines.forEach((l, i) => { if (/^第[一二三四五六七八九十百零〇\d]+章\s/.test(l.trim())) heads.push(i); });
const chapOf = ln => { let c = 0; for (const h of heads) { if (h <= ln) c++; else break; } return c - 1; };
for (const term of process.argv.slice(2)) {
  const idx = [];
  lines.forEach((l, i) => { if (l.includes(term)) idx.push(i); });
  if (!idx.length) { console.log(`${term}\t首现: 无`); continue; }
  const f = idx[0];
  console.log(`${term}\t首现 L${f + 1} ch${chapOf(f)}\t共${idx.length}处\t前3处: ${idx.slice(0, 3).map(i => 'ch' + chapOf(i)).join(',')}`);
}
