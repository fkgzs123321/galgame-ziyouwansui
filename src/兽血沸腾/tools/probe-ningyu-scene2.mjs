import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const show = (a, b, label) => {
  console.log(`\n${'═'.repeat(76)}\n══ ${label} L${a}~${b} ══`);
  for (let i = a; i <= b; i++) if (lines[i - 1]?.trim()) console.log(`L${i}: ${lines[i - 1].trim()}`);
};
show(72790, 72890, '凝玉 初夜/圆房 主场景');
show(5590, 5640, '凝玉 胸罩岛 湿身贴身');
show(6390, 6420, '凝玉 推开魔爪');
