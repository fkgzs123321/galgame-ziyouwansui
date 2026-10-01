// 判塔 → 潘塔（原文正确写法为「潘塔族」，指熊猫族）。
// 故事大纲.yaml 的 text: 字段是逐字原文引用，不在修正范围内。
import fs from 'fs';
const FILES = [
  'src/兽血沸腾/世界书/时间线/纵横篇·成长期进度.yaml',
  'src/兽血沸腾/世界书/事件/纵横·圣女和流氓与龙鳞道.yaml',
  'src/兽血沸腾/世界书/角色/角色速览.yaml',
  'src/兽血沸腾/创作规划.yaml',
];
let n = 0;
for (const f of FILES) {
  const t = fs.readFileSync(f, 'utf8');
  const c = (t.match(/判塔/g) || []).length;
  if (!c) { console.log(`·  ${f} 无匹配`); continue; }
  fs.writeFileSync(f, t.split('判塔').join('潘塔'), 'utf8');
  n += c;
  console.log(`✓  ${f}  修正 ${c} 处`);
}
console.log(`\n共修正 ${n} 处`);
