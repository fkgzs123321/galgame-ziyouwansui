import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const NPC = st.entryManifest.NPC;
console.log('══ NPC 条目原始定义 ══');
for (const [k, e] of Object.entries(NPC)) {
  console.log(`\n[${k}]`);
  console.log('  ' + JSON.stringify(e, null, 2).split('\n').join('\n  '));
}
