import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');
for (const w of ['荆棘护甲', '荆棘护甲之歌', '生命锁链']) {
  console.log(`\n══ ${w} (${t.split(w).length - 1}) ══`);
  let c = 0;
  for (let i = 0; i < lines.length && c < 4; i++) {
    if (!lines[i].includes(w)) continue;
    const j = lines[i].indexOf(w);
    console.log(`  L${i + 1}: …${lines[i].slice(Math.max(0, j - 100), j + 160).trim()}…`);
    c++;
  }
}
// 海伦 自然进化 战歌清单
console.log('\n══ 「自然进化」上下文样本 ══');
let c = 0;
for (let i = 0; i < lines.length && c < 10; i++) {
  if (!lines[i].includes('自然进化')) continue;
  const j = lines[i].indexOf('自然进化');
  console.log(`  L${i + 1}: …${lines[i].slice(Math.max(0, j - 80), j + 130).trim()}…`);
  c++;
}
