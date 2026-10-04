import fs from 'fs';
const f = '.skills/tavern-cards/tavern-cards/scripts/tavern-cards-forge.mjs';
const src = fs.readFileSync(f, 'utf8');
const lines = src.split('\n');
const pats = [/XML_OPEN_LINE_REGEX/, /analyzeEntryYamlContent/, /startsWith\('@@/, /startsWith\("@@/, /DECORATOR/];
const hits = new Set();
for (const p of pats) lines.forEach((l, i) => { if (p.test(l)) hits.add(i); });
const shown = new Set();
for (const i of [...hits].sort((a, b) => a - b)) {
  for (let k = Math.max(0, i - 4); k <= Math.min(lines.length - 1, i + 20); k++) {
    if (shown.has(k)) continue;
    shown.add(k);
    console.log(`${k + 1}| ${lines[k]}`);
  }
  console.log('   ---');
}
