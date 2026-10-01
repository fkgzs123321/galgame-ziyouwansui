import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const roles = st.entryManifest['角色'];
const keys = Object.keys(roles);

// 目标：10 个新 _性格调色盘
const NEW = {
  '黛丝': 'basic', '若尔娜': 'basic', '崔蓓茜': 'basic', '歌坦妮': 'basic',
  '果果': 'basic', '壹条': 'basic', '安度兰长老': 'basic', '茉儿': 'basic',
  '隆美尔': 'tri_faceted', '李察王子': 'tri_faceted',
};

console.log('══ 当前 角色 manifest 顺序（含 part）══');
keys.forEach((k, i) => {
  const l = roles[k];
  const tags = [];
  if (l.part) tags.push(l.part);
  if (l.rephrase) tags.push('rephrase');
  if (l.scope === 'catalog') tags.push('catalog');
  console.log(`  ${String(i).padStart(3)} ${k.padEnd(26)} ${tags.join(',')}`);
});

console.log('\n══ 插入计划 ══');
for (const [name, afterPart] of Object.entries(NEW)) {
  const target = `${name}_${afterPart === 'basic' ? '基础信息' : '三面性'}`;
  const i = keys.indexOf(target);
  console.log(`  ${(name + '_性格调色盘').padEnd(24)} 插到 ${target.padEnd(22)} 之后 (idx ${i})`);
}
