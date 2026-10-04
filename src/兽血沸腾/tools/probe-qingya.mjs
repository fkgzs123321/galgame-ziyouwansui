import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
for (const probe of ['白素青', '凝玉', '青雅']) {
  console.log(`\n═══ ${probe} ═══`);
  for (const [type, items] of Object.entries(st.entryManifest))
    for (const [k, v] of Object.entries(items))
      if ((v.keywords || []).includes(probe) || (v.strategy?.keys || []).includes(probe) || k.includes(probe))
        console.log(`  ${type}/${k}\n     keywords=${JSON.stringify(v.keywords)}`);
}
console.log('\n═══ 角色目录下含 凝玉/白素青 的文件夹 ═══');
for (const d of fs.readdirSync('src/兽血沸腾/世界书/角色', { withFileTypes: true }))
  if (d.isDirectory() && /凝玉|白素青|青雅/.test(d.name)) console.log('  ' + d.name);
