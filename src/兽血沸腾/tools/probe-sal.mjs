import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
for (const w of ['格雷克.萨尔', '格雷克·萨尔', '李察.萨尔', '萨尔亲王', '格雷克']) {
  console.log(`  ${w.padEnd(14)} ${t.split(w).length - 1}`);
}
console.log('\n══ 格雷克 上下文 ══');
const lines = t.split('\n');
let c = 0;
for (const l of lines) {
  if (c >= 6) break;
  if (!l.includes('格雷克')) continue;
  const i = l.indexOf('格雷克');
  console.log(`  …${l.slice(Math.max(0, i - 70), i + 130).trim()}…`);
  c++;
}
console.log('\n══ 人名中 . 与 · 的用法统计 ══');
console.log(`  海伦.列娜 ${t.split('海伦.列娜').length - 1}   海伦·列娜 ${t.split('海伦·列娜').length - 1}`);
console.log(`  福格森.徐 ${t.split('福格森.徐').length - 1}   福格森·徐 ${t.split('福格森·徐').length - 1}`);
