import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');

console.log('══ 「天鹅女骑士」上下文样本（最多 12 处）══');
let n = 0;
for (let i = 0; i < lines.length && n < 12; i++) {
  if (!lines[i].includes('天鹅女骑士')) continue;
  const s = Math.max(0, lines[i].indexOf('天鹅女骑士') - 60);
  console.log(`  L${i + 1}: …${lines[i].slice(s, s + 160).trim()}…`);
  n++;
}
console.log(`  总命中 ${t.split('天鹅女骑士').length - 1}`);

console.log('\n══ 海伦.列娜 与 天鹅 同现检查 ══');
for (const w of ['海伦.列娜', '海伦']) {
  let co = 0;
  for (const l of lines) if (l.includes(w) && l.includes('天鹅')) co++;
  console.log(`  含「${w}」且含「天鹅」的行: ${co}`);
}
