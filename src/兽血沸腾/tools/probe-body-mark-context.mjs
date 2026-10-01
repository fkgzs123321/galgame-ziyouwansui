// 把「命中 0」的 5 处原文上下文打印出来，判定是「臆造专名」还是「普通解剖同义词」。
import fs from 'fs';

const T = [
  ['加茜娅', '私密.yaml', '龙契'],
  ['加茜娅', '私密.yaml', '尾骨'],
  ['唐蓓尔金娜', '私密.yaml', '腰窝'],
  ['若尔娜', '私密.yaml', '尾骨'],
  ['阿仙奴', '私密.yaml', '腰窝'],
];

for (const [名, f, w] of T) {
  const p = `src/兽血沸腾/世界书/角色/${名}/${f}`;
  const 行 = fs.readFileSync(p, 'utf8').split('\n');
  console.log(`\n═══ ${名}/${f}  「${w}」 ═══`);
  行.forEach((l, i) => { if (l.includes(w)) console.log(`   L${i + 1}: ${l.trim().slice(0, 200)}`); });
}

// 原文里这些解剖词的近亲用法
const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
console.log('\n\n═══ 原文对照：这些解剖词的近亲 ═══');
for (const w of ['尾椎', '尾骨', '腰窝', '会阴', '臀缝', '股沟', '腰眼']) {
  console.log(`   ${w.padEnd(8)} ${原.split(w).length - 1}`);
}
console.log('\n── 「尾椎」「会阴」在原文里的原句 ──');
原.split('\n').forEach((l, i) => {
  if (l.includes('尾椎') || l.includes('会阴')) console.log(`   L${i}: ${l.trim().slice(0, 150)}`);
});
