import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
let n = 0;
for (const [type, entries] of Object.entries(st.entryManifest)) {
  for (const [name, leaf] of Object.entries(entries)) {
    const kw = leaf.keywords ?? [];
    const uniq = [...new Set(kw)];
    if (uniq.length !== kw.length) {
      console.log(`  [${type}] ${name}\n      ${JSON.stringify(kw)}  ->  ${JSON.stringify(uniq)}`);
      n++;
    }
  }
}
console.log(`\n共 ${n} 条 keywords 有重复项`);
