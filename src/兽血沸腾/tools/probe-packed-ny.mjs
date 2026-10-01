import fs from 'fs';
const o = JSON.parse(fs.readFileSync('src/兽血沸腾/兽血沸腾.json', 'utf8'));
const entries = o?.data?.character_book?.entries || o?.character_book?.entries || [];
console.log('总条目:', entries.length);
const hit = entries.filter(e => typeof e.content === 'string' && e.content.includes('<character_other'));
console.log('character_other 条目:', hit.length);
for (const e of hit) {
  console.log(`\n【${e.comment}】constant=${e.constant} keys=${JSON.stringify(e.keys)} order=${e.order} depth=${e.depth} position=${e.position}`);
  const lines = e.content.split('\n');
  console.log('  首 6 行:');
  lines.slice(0, 6).forEach((l, n) => console.log(`   ${n + 1}| ${l.slice(0, 150)}`));
  console.log('  ...');
  console.log('  末 3 行:');
  lines.slice(-3).forEach(l => console.log(`     | ${l.slice(0, 150)}`));
  console.log(`  共 ${lines.length} 行 / ${e.content.length} 字符`);
}
