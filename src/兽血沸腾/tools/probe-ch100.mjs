// 读「第一百章 挥刀问情」现场，确定断臂的真实缘由。
import fs from 'fs';

const 行 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');

// 找章节标题行
let 起 = -1;
行.forEach((l, i) => { if (l.includes('第一百章') && l.includes('挥刀问情')) 起 = i; });
console.log('章标题 L' + 起 + ': ' + 行[起]);

// 往后读 120 行原文，只看有实义的
let c = 0;
for (let i = 起; i < 起 + 260 && c < 42; i++) {
  const t = (行[i] ?? '').trim();
  if (t.length < 12) continue;
  console.log(`   L${i}: ${t.slice(0, 168)}`);
  c++;
}
