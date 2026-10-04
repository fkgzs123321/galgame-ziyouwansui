// 复核 加茜娅/私密阶段.yaml 第 4 档（解甲）与第 3 档的叙事性断言是否有原文依据。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数 = s => 原.split(s).length - 1;

const 词 = ['吉格斯', '龙契', '烙印', '短笛', '碧玉龙', '金色头盔', '宝剑橡叶'];
console.log('══ 全程命中数 ══');
for (const w of 词) console.log(`   ${w.padEnd(10)} ${数(w)}`);

for (const w of ['吉格斯', '龙契', '短笛']) {
  console.log(`\n══ 「${w}」命中行 ══`);
  let c = 0;
  行.forEach((l, i) => { if (l.includes(w) && c < 8) { console.log(`   L${i}: ${l.trim().slice(0, 130)}`); c++; } });
  if (!c) console.log('   （0 命中）');
}

console.log('\n══ 「加茜娅」+「短笛」共现行 ══');
行.forEach((l, i) => { if (l.includes('加茜娅') && l.includes('短笛')) console.log(`   L${i}: ${l.trim().slice(0, 130)}`); });

console.log('\n══ 加茜娅 全部出场行的章号分布（粗看终盘是否真的没有她）══');
const 章 = [];
for (let i = 0; i < 行.length; i++) if (/^\s*第[一二三四五六七八九十百千零]+章\s/.test(行[i])) 章.push(i);
const 行到章 = i => { let c = 0; for (const h of 章) if (h <= i) c++; else break; return c - 1; };
const 出 = 行.map((l, i) => [i, l]).filter(([, l]) => l.includes('加茜娅'));
console.log(`   共 ${出.length} 行，最后一次在 L${出[出.length - 1][0]} idx≈${行到章(出[出.length - 1][0])}`);
console.log('   最后 6 行：');
出.slice(-6).forEach(([i, l]) => console.log(`      L${i} idx≈${行到章(i)}: ${l.trim().slice(0, 110)}`));
