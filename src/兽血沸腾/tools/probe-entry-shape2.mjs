import fs from 'fs';
const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));
for (const k of ['海伦.列娜_基础信息', '海伦.列娜_性格调色盘', '海伦.列娜_私密阶段', '海伦.列娜_二次解释']) {
  const v = st.entryManifest.角色[k];
  if (!v) { console.log(`── ${k} : 不存在`); continue; }
  console.log(`\n── 角色/${k}`);
  console.log(JSON.stringify(v, null, 1).slice(0, 700));
}
console.log('\n── NPC/罗德曼');
console.log(JSON.stringify(st.entryManifest.NPC['罗德曼'], null, 1).slice(0, 500));
console.log('\n── 角色 全部条目名（海伦相关）');
console.log(Object.keys(st.entryManifest.角色).filter(k => k.startsWith('海伦')).join(' , '));
console.log('\n── strategy 取值分布（角色）');
const c = {};
for (const v of Object.values(st.entryManifest.角色)) { const t = v.strategy?.type ?? '无'; c[t] = (c[t] || 0) + 1; }
console.log(JSON.stringify(c));
console.log('\n── strategy 取值分布（NPC）');
const c2 = {};
for (const v of Object.values(st.entryManifest.NPC)) { const t = v.strategy?.type ?? '无'; c2[t] = (c2[t] || 0) + 1; }
console.log(JSON.stringify(c2));
