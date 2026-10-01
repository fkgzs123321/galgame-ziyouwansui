import fs from 'fs';
const NPC = 'src/兽血沸腾/世界书/NPC/';
for (const n of process.argv.slice(2)) {
  const t = fs.readFileSync(NPC + n + '.yaml', 'utf8');
  const q = [...t.matchAll(/^    - (".*")$/gm)].map(m => JSON.parse(m[1]));
  console.log(`\n--- ${n} (${q.length}) ---`);
  q.forEach(x => console.log('  ' + x));
}
