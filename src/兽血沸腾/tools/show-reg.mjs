import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const roles = st.entryManifest['角色'];

for (const k of Object.keys(roles)) {
  if (/穆里尼奥|嘉宝|白素青|刘震撼|艾薇尔/.test(k)) {
    console.log(`\n── ${k}`);
    console.log('  ' + JSON.stringify(roles[k], null, 2).split('\n').join('\n  '));
  }
}
