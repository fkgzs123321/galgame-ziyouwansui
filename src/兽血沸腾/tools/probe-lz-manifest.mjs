import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
for (const 类型 of Object.keys(st.entryManifest ?? {})) {
  for (const [leaf, v] of Object.entries(st.entryManifest[类型] ?? {})) {
    if (!/刘震撼|海伦/.test(leaf)) continue;
    if (!v || typeof v !== 'object') continue;
    console.log(`[${类型}] ${leaf}`);
    console.log(`   path=${v.path ?? '（无）'}`);
    console.log(`   contents=${v.contents ? JSON.stringify(v.contents).slice(0, 220) : '（无）'}`);
  }
}
console.log('\n── 文件首行 ──');
for (const f of ['世界书/角色/刘震撼/基础信息.yaml', '世界书/角色/海伦.列娜/基础信息.yaml']) {
  const t = fs.readFileSync('src/兽血沸腾/' + f, 'utf8');
  console.log(`${f}: 首行=${JSON.stringify(t.split('\n')[0])}  含<%_=${t.includes('<%_')}`);
}
