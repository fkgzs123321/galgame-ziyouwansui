// 核验：刘震撼为何挥刀断臂？SkillTreePanel 写「为艾薇尔断臂后装上的秘银义肢」。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');

// SkillTreePanel 里的原话
const t = fs.readFileSync('src/兽血沸腾/界面/状态栏/components/SkillTreePanel.vue', 'utf8');
console.log('── SkillTreePanel 里含「艾薇尔」「秘银」的行 ──');
t.split('\n').forEach((l, i) => { if (/艾薇尔|秘银|断臂/.test(l)) console.log(`   L${i + 1}: ${l.trim().slice(0, 200)}`); });

console.log('\n── 原文：挥刀断臂 的语境（前后各 2 行）──');
[54931, 57579].forEach(k => {
  for (let i = k - 3; i <= k + 2; i++) if (行[i]) console.log(`   L${i}: ${行[i].trim().slice(0, 160)}`);
  console.log('   ---');
});

console.log('\n── 「八门金锁阵」上下文 ──');
let c = 0;
行.forEach((l, i) => { if (l.includes('八门金锁阵') && c < 8) { console.log(`   L${i}: ${l.trim().slice(0, 160)}`); c++; } });

console.log('\n── 首次出现「秘银手臂/秘银胳膊/秘银左臂」 ──');
c = 0;
行.forEach((l, i) => { if (/秘银(手臂|胳膊|左臂|拳头)/.test(l) && c < 6) { console.log(`   L${i}: ${l.trim().slice(0, 150)}`); c++; } });
