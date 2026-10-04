// 核验技能树里两个可疑节点的原文依据：艾薇尔的断臂义肢、天鹅族骑士。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数 = s => 原.split(s).length - 1;

for (const w of ['秘银', '断臂', '义肢', '假肢', '金肢', '天鹅族', '斯迈族', '天鹅', '米格军团', '米格', '姜之忍耐夔鼓', '夔鼓', '夔歌']) {
  console.log(`   ${w.padEnd(12)} ${数(w)}`);
}

console.log('\n── 「断臂」上下文 ──');
行.forEach((l, i) => { if (l.includes('断臂')) console.log(`   L${i}: ${l.trim().slice(0, 150)}`); });

console.log('\n── 「天鹅族」上下文 ──');
行.forEach((l, i) => { if (l.includes('天鹅族')) console.log(`   L${i}: ${l.trim().slice(0, 150)}`); });

console.log('\n── 「义肢 / 假肢 / 金肢」上下文 ──');
行.forEach((l, i) => { if (/义肢|假肢|金肢/.test(l)) console.log(`   L${i}: ${l.trim().slice(0, 150)}`); });
