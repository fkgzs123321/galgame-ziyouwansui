// 核验「超丰富的 NSFW / 后宫 / 怀孕系统」这条自定义要求是否真的落到三处一致：
// ① schema.ts ② initvar.yaml ③ HaremPanel.vue ④ 世界观条目 ⑤ 变量更新规则
import fs from 'fs';

const F = {
  schema: 'src/兽血沸腾/schema.ts',
  initvar: 'src/兽血沸腾/世界书/变量/initvar.yaml',
  panel: 'src/兽血沸腾/界面/状态栏/components/HaremPanel.vue',
  rules: 'src/兽血沸腾/世界书/变量/变量更新规则.yaml',
};
const 文 = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, fs.readFileSync(p, 'utf8')]));

// 孕期四阶段（契约）
const 阶 = ['确诊', '显怀', '临产', '分娩'];
console.log('── 孕期四阶段契约 ──');
for (const [k, t] of Object.entries(文)) {
  const 有 = 阶.filter(s => t.includes(s));
  console.log(`   ${k.padEnd(9)} ${有.length}/4  ${有.join(' · ')}`);
}

// 后宫子键
const 键 = ['成员', '子嗣', '孕事', '房事', '亲密记录'];
console.log('\n── 后宫子键 ──');
for (const [k, t] of Object.entries(文)) {
  const 有 = 键.filter(s => t.includes(s));
  console.log(`   ${k.padEnd(9)} ${有.length}/5  ${有.join(' · ')}`);
}

// 房事 15 部位
const 部 = ['奶子', '奶头', '乳晕', '逼', '阴唇', '阴蒂', '屁眼', '腰腹', '臀部', '腿', '足', '手', '口舌', '腋下', '发肤'];
console.log('\n── 房事 15 部位（变量更新规则）──');
const 有 = 部.filter(s => 文.rules.includes(s));
console.log(`   ${有.length}/15  ${有.join(' · ')}`);

// HaremPanel 的功能面
console.log('\n── HaremPanel 的交互函数 ──');
for (const m of 文.panel.matchAll(/function\s+(\w+)/g)) console.log(`   ${m[1]}`);
console.log('\n── HaremPanel 的页签/分区标题 ──');
for (const m of 文.panel.matchAll(/label:\s*'([^']+)'/g)) console.log(`   ${m[1]}`);
