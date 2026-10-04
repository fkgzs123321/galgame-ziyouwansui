// 探针：核对 朝河兰/基础信息 里那条「陛下消消火」到底是谁说的，并取出待修引文的原文原样。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const L = 原.split('\n');

const 找 = q => {
  const i = L.findIndex(l => l.includes(q));
  if (i < 0) return null;
  return { 行: i + 1, 文: L[i].trim() };
};

console.log('══ 「陛下消消火」的上下文 ══');
const r = 找('陛下消消火');
if (r) {
  console.log(`  L${r.行}: ${r.文.slice(0, 200)}`);
  console.log('  —— 往前找说话人 ——');
  for (let i = r.行 - 2; i >= r.行 - 14 && i > 0; i--) {
    const t = (L[i - 1] || '').trim();
    if (t) console.log(`  L${i}: ${t.slice(0, 150)}`);
  }
} else console.log('  ✗ 找不到');

console.log('\n══ 待修正引文的原文原样 ══');
for (const q of [
  '事实上比蒙王国的实力',
  '根据玛莉亚.高树女公爵的汇报',
  '通知贝肯鲍尔陛下，立刻发动对比蒙的攻势',
  '我们亚力士帝国也给进军沙巴克的部队',
  '比蒙骑兵正在屠杀我的部下',
  '大家不必过分担心，这个领地的兽人',
]) {
  const x = 找(q);
  console.log(`\n  【${q.slice(0, 16)}…】`);
  if (x) console.log(`  L${x.行}: ${x.文.slice(0, 240)}`);
  else console.log('  ✗ 找不到');
}
