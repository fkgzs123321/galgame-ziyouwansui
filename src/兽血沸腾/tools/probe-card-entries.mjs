import fs from 'fs';
const card = JSON.parse(fs.readFileSync('src/兽血沸腾/兽血沸腾.json', 'utf8'));
const es = card.data.character_book.entries;
for (const want of ['罗德曼', '海伦.列娜_基础信息', '海伦.列娜_性格调色盘', '刘震撼_基础信息']) {
  const e = es.find(x => (x.comment || '') === want);
  if (!e) { console.log(`\n「${want}」未找到`); continue; }
  console.log(`\n══ 「${want}」 keys=${Object.keys(e).join(',')}`);
  console.log(`   strategy=${JSON.stringify(e.strategy ?? e.constant ?? '?')} position=${JSON.stringify(e.position ?? e.order ?? '?')}`);
  const ls = (e.content || '').split('\n');
  console.log(`   正文 ${ls.length} 行，前 3 / 后 2 行:`);
  for (const l of ls.slice(0, 3)) console.log(`     ${JSON.stringify(l.slice(0, 100))}`);
  console.log('     …');
  for (const l of ls.slice(-2)) console.log(`     ${JSON.stringify(l.slice(0, 100))}`);
}
// 是否存在含 XML 的 NPC 条目
const npc = es.filter(e => /^<character_(basic|personality|facets|other)/.test(e.content || ''));
console.log(`\n以 XML 标签开头的条目 ${npc.length}`);
console.log('样例: ' + npc.slice(0, 6).map(e => e.comment).join(' , '));
