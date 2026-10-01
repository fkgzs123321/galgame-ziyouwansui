import fs from 'fs';
const card = JSON.parse(fs.readFileSync('src/兽血沸腾/兽血沸腾.json', 'utf8'));
const es = card.data.character_book.entries;
console.log(`条目 ${es.length}`);
// 统计正文里出现的装饰器/EJS
let at = 0, ejs = 0, assign = 0, ifHead = 0;
const 样 = [];
for (const e of es) {
  const c = e.content || '';
  if (c.includes('@@')) { at++; if (样.length < 8) 样.push([e.comment, c.split('\n').slice(0, 3)]); }
  if (c.includes('<%_')) ejs++;
  if (c.includes('__ASSIGN__')) assign++;
  if (/^\s*@@if/.test(c)) ifHead++;
}
console.log(`含 @@ 的条目 ${at}；含 <%_ 的 ${ejs}；含 __ASSIGN__ 的 ${assign}；首行 @@if 的 ${ifHead}`);
console.log('\n样（含 @@）：');
for (const [cm, ls] of 样) { console.log(`  「${cm}」`); for (const l of ls) console.log(`     ${JSON.stringify(l)}`); }
// 找地理的守卫（bucket C 范式已确认可用）
const g = es.find(e => /华东|荒岛|南十字/.test(e.comment || ''));
if (g) console.log(`\n地理样本「${g.comment}」前 4 行:\n` + g.content.split('\n').slice(0, 4).map(l => '   ' + JSON.stringify(l)).join('\n'));
