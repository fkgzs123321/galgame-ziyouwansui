// 复核 加茜娅 私密阶段.yaml 的「右侧肋下」是否有原文依据。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数 = s => 原.split(s).length - 1;

console.log('══ 部位词全程命中数 ══');
for (const w of ['肋下', '肋', '胳膊上的伤', '挂了彩', '挂彩', '受伤', '伤口']) {
  console.log(`   ${w.padEnd(12)} ${数(w)}`);
}

console.log('\n══ 「肋下」全部命中行 ══');
行.forEach((l, i) => { if (l.includes('肋下')) console.log(`   L${i}: ${l.trim().slice(0, 120)}`); });

console.log('\n══ 「胳膊上的伤」命中行 ══');
行.forEach((l, i) => { if (l.includes('胳膊上的伤')) console.log(`   L${i}: ${l.trim().slice(0, 140)}`); });

console.log('\n══ 加茜娅 + 伤/彩 共现行 ══');
行.forEach((l, i) => {
  if (l.includes('加茜娅') && /伤|彩|血/.test(l)) console.log(`   L${i}: ${l.trim().slice(0, 150)}`);
});
