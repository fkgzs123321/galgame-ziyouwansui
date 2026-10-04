import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');
// 找 L7026 附近，以及早期 刘震撼 救 海伦 的战歌
console.log('══ L7010-7040 ══');
for (let i = 7009; i < 7040; i++) if (lines[i]?.trim()) console.log(`  ${i + 1}: ${lines[i].trim().slice(0, 190)}`);
console.log('\n══ 早期「救回」+战歌 ══');
let c = 0;
for (let i = 0; i < 40000 && c < 8; i++) {
  if (!/锁链战歌/.test(lines[i])) continue;
  console.log(`  L${i + 1}: ${lines[i].trim().slice(0, 200)}`);
  c++;
}
