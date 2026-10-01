import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const em = st.entryManifest;
console.log('══ NPC 完整条目样例 ══');
console.log(JSON.stringify(em.NPC['翡冷翠核心家臣'], null, 2));
console.log('\n══ 角色 完整条目样例（对照）══');
console.log(JSON.stringify(em.角色['普斯卡什_基础信息'], null, 2));
console.log('\n══ 阶段指导 ══');
console.log(JSON.stringify(Object.values(em.阶段指导)[0], null, 2));
