// 在 54 个角色的 基础信息.yaml 之间做两两相似度扫描，找出「同一个人被拆成两个角色」的情况。
// 做法：提取每个文件的字词集合（二元中文组），算 Jaccard 相似度；再把疑似对拿到原文里做身份核验。
import fs from 'fs';
import path from 'path';

const DIR = 'src/兽血沸腾/世界书/角色';
const TXT = 'src/兽血沸腾/兽血沸腾.txt';

const names = fs
  .readdirSync(DIR)
  .filter(n => fs.statSync(path.join(DIR, n)).isDirectory() && fs.existsSync(path.join(DIR, n, '基础信息.yaml')));

const bigrams = t => {
  const s = t.replace(/[\s\d\p{P}]/gu, '');
  const out = new Set();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
};

const sets = new Map();
for (const n of names) sets.set(n, bigrams(fs.readFileSync(path.join(DIR, n, '基础信息.yaml'), 'utf8')));

const jac = (a, b) => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
};

const pairs = [];
for (let i = 0; i < names.length; i++)
  for (let j = i + 1; j < names.length; j++) {
    const s = jac(sets.get(names[i]), sets.get(names[j]));
    if (s > 0.25) pairs.push([names[i], names[j], s]);
  }
pairs.sort((a, b) => b[2] - a[2]);

console.log('════ 基础信息 相似度 > 0.25 的角色对 ════');
console.log('角色A'.padEnd(14) + '角色B'.padEnd(14) + 'Jaccard  ' + '原文共现佐证');
console.log('─'.repeat(88));

const lines = fs.readFileSync(TXT, 'utf8').split('\n');
for (const [a, b, s] of pairs) {
  // 原文里是否出现 "A…B" 同一句、或 "B A" 连写（命名关系）
  const 连写 = new RegExp(`${b}\\s*${a}|${a}\\s*${b}|${a}的?${b}`);
  const hits = lines.filter(l => l.includes(a) && l.includes(b)).length;
  const 直接命名 = lines.filter(l => 连写.test(l) && /叫|名字|起名|命名|就是|正是|原名/.test(l)).length;
  const tags = [];
  if (hits) tags.push(`同句${hits}`);
  if (直接命名) tags.push(`命名句${直接命名}`);
  console.log(
    a.padEnd(14) + b.padEnd(14) + s.toFixed(3).padEnd(9) + (tags.join(' ') || '无'),
  );
}
if (!pairs.length) console.log('（无相似度超阈值的角色对）');
