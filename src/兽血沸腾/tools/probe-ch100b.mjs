// 在第一百章内定位「挥刀断臂」的真正触发点。
import fs from 'fs';

const 行 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const 起 = 28781;
const 终 = 28897; // 下一章标题前后

console.log('── 第一〇〇章尾部 / 断臂前後（L28865-28920）──');
for (let i = 28865; i < 28925; i++) {
  const t = (行[i] ?? '').trim();
  if (t.length < 8) continue;
  console.log(`   L${i}: ${t.slice(0, 172)}`);
}
