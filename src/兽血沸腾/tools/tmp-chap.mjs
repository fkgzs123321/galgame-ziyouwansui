// 临时：给定词，打印每处匹配的章号与行号。用完即删。
import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const heads = [];
lines.forEach((l, i) => { if (/^第[一二三四五六七八九十百零〇\d]+章\s/.test(l.trim())) heads.push(i); });
const chapOf = ln => { let c = 0; for (const h of heads) { if (h <= ln) c++; else break; } return c - 1; };
for (const term of process.argv.slice(2)) {
  console.log(`\n### ${term}`);
  let n = 0;
  lines.forEach((l, i) => {
    if (!l.includes(term)) return;
    n++;
    if (n > 40) return;
    console.log(`  L${i + 1} ch${chapOf(i)}  ${l.trim().slice(0, 90)}`);
  });
  console.log(`  共 ${n} 处`);
}
