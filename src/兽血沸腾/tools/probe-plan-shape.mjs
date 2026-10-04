// 只读：打印 era-demote-plan.json 的结构与海伦.列娜的全部命中点
import fs from 'fs';
const plan = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-demote-plan.json', 'utf8'));
console.log('顶层键: ' + Object.keys(plan).join(' · '));
console.log(`身份类 ${plan.身份类.length} / 叙述类 ${plan.叙述类.length}`);
console.log('\n身份类[0]: ' + JSON.stringify(plan.身份类[0], null, 2));
console.log('\n叙述类[0]: ' + JSON.stringify(plan.叙述类[0], null, 2));

const 名 = process.argv[2] || '海伦.列娜';
console.log(`\n══ ${名} 全部命中 ══`);
for (const x of [...plan.身份类, ...plan.叙述类].filter(r => r.名 === 名))
  console.log(`  [${x.桶 ?? x.类 ?? '?'}] ${x.节} · ${x.键 ?? x.字段 ?? '?'}\n      ${String(x.文 ?? x.文本 ?? x.值 ?? '').slice(0, 220)}`);
