// 探针：查「事实上比蒙王国的实力，还不止你们目前了解的范畴」的出处。
import fs from 'fs';

const L = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');

for (const q of [
  '事实上比蒙王国的实力',
  '不止你们目前了解的范畴',
  '你们目前了解的范畴',
  '还不止你们',
  '了解的范畴',
  '事实上，比蒙王国',
  '比蒙王国的实力',
]) {
  const hits = [];
  L.forEach((l, i) => { if (l.includes(q)) hits.push(i + 1); });
  console.log(`  「${q}」 → ${hits.length} 行${hits.length ? '：' + hits.slice(0, 5).join(', ') : ''}`);
}
console.log('\n══ 「比蒙王国的实力」各处上下文 ══');
L.forEach((l, i) => {
  if (l.includes('比蒙王国的实力')) {
    console.log(`  L${i + 1}: ${l.trim().slice(0, 220)}`);
  }
});
