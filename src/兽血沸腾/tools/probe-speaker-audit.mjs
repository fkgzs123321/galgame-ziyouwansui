// 探针：「陛下消消火…」是朝河兰说的，还是海蛇幕僚长说的？
import fs from 'fs';

const L = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');

const at = L.findIndex(l => l.includes('陛下消消火')) + 1;
console.log(`「陛下消消火」位于 L${at}\n`);
console.log('══ 前后 ±25 行里出现的说话人标签 ══');
for (let i = Math.max(1, at - 25); i <= at + 25; i++) {
  const t = (L[i - 1] || '').trim();
  if (!t) continue;
  const 标 = /幕僚长|朝河兰|贝肯鲍尔|海皇|女王|陛下|说道|说：|道：/.test(t);
  if (标) console.log(`  L${i}: ${t.slice(0, 170)}`);
}
console.log('\n══ 「幕僚长」全书首次出现与附近 ══');
const 幕 = [];
L.forEach((l, i) => { if (l.includes('幕僚长')) 幕.push(i + 1); });
console.log(`  共 ${幕.length} 行，首见 L${幕[0]}`);
console.log(`  距 L${at} 最近的：${幕.reduce((a, b) => Math.abs(b - at) < Math.abs(a - at) ? b : a)}`);
