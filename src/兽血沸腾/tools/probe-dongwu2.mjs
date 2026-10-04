import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
for (const i of [93012, 97952, 92860, 92912, 99214]) {
  console.log(`L${i}: ${lines[i - 1].trim().slice(0, 240)}\n`);
}
console.log('══ 唐藏亲王 外貌相关（含 僧侣/年少/英俊/光头）══');
for (const kw of ['英俊无比的东方僧侣', '雪白', '金环杖', '托钵', '苦行僧侣']) {
  const h = [];
  lines.forEach((l, i) => { if (l.includes(kw)) h.push(i + 1); });
  console.log(`  ${kw}: ${h.slice(0, 5).join(', ')}`);
}
