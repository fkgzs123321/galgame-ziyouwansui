// 复核 4 处「也写作/又写作」别名是否原文真有。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 数 = s => 原.split(s).length - 1;
const 行 = 原.split('\n');

const 查 = [
  ['古德', '潘帅'], ['崔蓓茜', '崔蓓西'], ['崔蓓茜', '妮可'],
  ['梦露', '玛丽莲·梦露'], ['梦露', '玛丽莲'], ['梦露', '梦露陛下'], ['梦露', '梦露女王'],
  ['艾弗森', '艾佛森'], ['海华丝', '丽塔.海华丝'], ['海华丝', '丽塔'],
];

console.log('主体'.padEnd(10) + '别名'.padEnd(16) + '原文命中');
console.log('─'.repeat(40));
for (const [a, b] of 查) console.log(a.padEnd(10) + b.padEnd(16) + 数(b));

console.log('\n── 「玛丽莲」原文全部行 ──');
行.forEach((l, i) => { if (l.includes('玛丽莲')) console.log(`   L${i}: ${l.trim().slice(0, 150)}`); });

console.log('\n── 「艾佛森」原文全部行 ──');
行.forEach((l, i) => { if (l.includes('艾佛森')) console.log(`   L${i}: ${l.trim().slice(0, 130)}`); });

console.log('\n── 「潘帅」原文前 3 行 ──');
let c = 0;
行.forEach((l, i) => { if (l.includes('潘帅') && c < 3) { console.log(`   L${i}: ${l.trim().slice(0, 130)}`); c++; } });
