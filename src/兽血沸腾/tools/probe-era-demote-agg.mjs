// 只读：把降级清单按节聚合，并核对哪些涉及角色已有 性格调色盘（可复用其纪元分支）。
import fs from 'fs';

const plan = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-demote-plan.json', 'utf8'));
const 涉及 = plan.涉及;

const 节 = {};
for (const x of plan.叙述类) 节[x.节] = (节[x.节] || 0) + 1;
console.log('══ 桶二按节分布 ══');
Object.entries(节).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`   ${k.padEnd(8)} ${v}`));

console.log('\n══ 按角色：命中数 / 是否有调色盘 ══');
const 有调色盘 = 名 => fs.existsSync(`src/兽血沸腾/世界书/角色/${名}/性格调色盘.yaml`);
const 有私密阶段 = 名 => fs.existsSync(`src/兽血沸腾/世界书/角色/${名}/私密阶段.yaml`);
const per = {};
for (const x of [...plan.身份类, ...plan.叙述类]) {
  per[x.名] ??= { 登场: x.登场, n: 0 };
  per[x.名].n++;
}
let 无盘 = [], 无阶段 = [];
for (const [名, v] of Object.entries(per).sort((a, b) => a[1].登场 - b[1].登场)) {
  const p = 有调色盘(名), s = 有私密阶段(名);
  if (!p) 无盘.push(名);
  if (!s) 无阶段.push(名);
  console.log(`  登场${String(v.登场).padStart(4)} ${名.padEnd(14)} 命中${String(v.n).padStart(3)}  调色盘${p ? '有' : '—'}  私密阶段${s ? '有' : '—'}`);
}
console.log(`\n涉及 ${Object.keys(per).length} 人；无调色盘 ${无盘.length}: ${无盘.join('、') || '无'}`);
console.log(`无调色盘者其中私密阶段也无: ${无盘.filter(n => !有私密阶段(n)).join('、') || '无'}`);
