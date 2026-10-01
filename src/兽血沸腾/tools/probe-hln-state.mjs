import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
for (const k of ['海伦.列娜_基础信息', '刘震撼_基础信息']) {
  const v = st.entryManifest.角色[k];
  console.log(`\n════ 角色/${k} ════`);
  console.log(JSON.stringify(v, null, 1).slice(0, 1400));
}
