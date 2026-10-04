import fs from 'fs';
const o = JSON.parse(fs.readFileSync('src/兽血沸腾/兽血沸腾.json', 'utf8'));
const entries = o?.data?.character_book?.entries || [];
for (const e of entries) {
  if (!/凝玉_私密/.test(String(e.comment))) continue;
  const lines = String(e.content).split('\n');
  console.log(`\n【${e.comment}】constant=${e.constant} keys=${JSON.stringify(e.keys)} position=${e.position}`);
  lines.slice(0, 5).forEach((l, n) => console.log(`  ${n + 1}| ${l.slice(0, 140)}`));
  console.log(`  ... 共 ${lines.length} 行 / ${e.content.length} 字符`);
  console.log(`  末行: ${lines[lines.length - 1].slice(0, 100)}`);
}
