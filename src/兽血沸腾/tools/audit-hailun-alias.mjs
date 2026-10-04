import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');
for (const w of ['小狐狸', '福克斯族', '狐人', '狐狸祭祀', '战争祭祀海伦', '海伦祭祀', '狐族美女', '狐狸女']) {
  const c = t.split(w).length - 1;
  let co = 0;
  for (const l of lines) if (l.includes(w) && l.includes('海伦')) co++;
  console.log(`  ${w.padEnd(14)} 总 ${String(c).padStart(5)}   与海伦同行 ${String(co).padStart(4)}`);
}
console.log('\n══ 「小狐狸」样本 ══');
let n = 0;
for (const l of lines) {
  if (n >= 8) break;
  if (!l.includes('小狐狸')) continue;
  const i = l.indexOf('小狐狸');
  console.log(`  …${l.slice(Math.max(0, i - 50), i + 110).trim()}…`);
  n++;
}
