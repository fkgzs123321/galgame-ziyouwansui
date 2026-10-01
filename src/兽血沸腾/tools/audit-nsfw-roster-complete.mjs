// 核验「女性角色都要写」的落实：哪些女性角色有条目但没有 私密/私密阶段，以及是否属于已裁定排除的 5 人。
import fs from 'fs';
import path from 'path';

const 角 = 'src/兽血沸腾/世界书/角色';
const NPC = 'src/兽血沸腾/世界书/NPC';

// 裁定排除（原文把该身体写成非成年 / 非人形）
const 排除 = new Set(['海伦.列娜', '海伦', '茉儿', '茜茜', '姬丝凯碧', '喀秋莎']);

const 有私密 = [];
const 无私密 = [];
for (const d of fs.readdirSync(角)) {
  const dir = path.join(角, d);
  if (!fs.statSync(dir).isDirectory()) continue;
  const 有 = fs.readdirSync(dir);
  const 项 = { 名: d, 基础: 有.includes('基础信息.yaml'), 调色: 有.includes('性格调色盘.yaml'), 私密: 有.includes('私密.yaml'), 阶段: 有.includes('私密阶段.yaml') };
  if (项.私密 && 项.阶段) 有私密.push(项);
  else 无私密.push(项);
}

console.log(`══ 有 私密+私密阶段 的角色：${有私密.length} 人 ══`);
console.log('   ' + 有私密.map(x => x.名).join(' · '));

console.log(`\n══ 缺 私密 或 私密阶段 的角色：${无私密.length} 人 ══`);
for (const x of 无私密) {
  const 标 = 排除.has(x.名) ? '○ 已裁定排除' : '★ 需复核';
  console.log(`   ${标}  ${x.名.padEnd(14)} 基础=${x.基础 ? 'Y' : 'n'} 调色=${x.调色 ? 'Y' : 'n'} 私密=${x.私密 ? 'Y' : 'n'} 阶段=${x.阶段 ? 'Y' : 'n'}`);
}

const 需 = 无私密.filter(x => !排除.has(x.名));
console.log(`\n══ 其中非排除名单、需要复核的：${需.length} 人 ══`);
for (const x of 需) console.log(`   ★ ${x.名}`);

// NPC 里是否还有女性专条未被升格
console.log(`\n══ NPC 专条 ${fs.readdirSync(NPC).filter(f => f.endsWith('.yaml')).length} 个 ══`);
console.log(`══ 私密相关条目总数（角色目录内）══`);
let n = 0;
for (const d of fs.readdirSync(角)) {
  const dir = path.join(角, d);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) if (f === '私密.yaml' || f === '私密阶段.yaml') n++;
}
console.log(`   ${n}`);
