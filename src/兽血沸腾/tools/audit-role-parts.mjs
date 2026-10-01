import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const roles = st.entryManifest['角色'] ?? {};

// 按人物归组 part
const byPerson = {};
for (const [k, v] of Object.entries(roles)) {
  const m = k.match(/^(.+?)_(基础信息|性格调色盘|三面性|其他)$/);
  if (!m) { console.log(`  [无法解析] ${k}  part=${v.part}`); continue; }
  (byPerson[m[1]] ??= {})[m[2]] = true;
}

const PARTS = ['基础信息', '性格调色盘', '三面性'];
console.log('人物                 基础信息 性格调色盘 三面性');
const incomplete = [];
for (const [p, have] of Object.entries(byPerson)) {
  const marks = PARTS.map(x => (have[x] ? '   ✓   ' : '   —   '));
  const missing = PARTS.filter(x => !have[x]);
  console.log(`  ${p.padEnd(20)} ${marks.join(' ')}`);
  if (missing.length) incomplete.push([p, missing]);
}
console.log(`\n共 ${Object.keys(byPerson).length} 个人物角色；缺 part 的 ${incomplete.length} 个：`);
incomplete.forEach(([p, m]) => console.log(`  ${p}: 缺 ${m.join('、')}`));
