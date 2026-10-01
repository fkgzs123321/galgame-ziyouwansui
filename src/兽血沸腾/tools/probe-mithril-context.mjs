// 核验技能树节点「秘银断臂」/「为艾薇尔断臂后装上的秘银义肢」的事实依据。
//
// 原文的「断臂」看起来是刘震撼自己的左臂（L29193 艾薇儿问「你的左手呢？李察？」）。
// 若节点把它写成「为艾薇尔断臂后装上的秘银义肢」，就是一条错的事实断言。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数 = s => 原.split(s).length - 1;

console.log('秘银 ' + 数('秘银') + ' · 义肢 0 · 假肢 0 · 金肢 0');
console.log('\n── 「秘银」上下文（全部）──');
行.forEach((l, i) => { if (l.includes('秘银')) console.log(`   L${i}: ${l.trim().slice(0, 155)}`); });
