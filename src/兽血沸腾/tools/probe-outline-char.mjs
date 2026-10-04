import fs from 'fs';
import YAML from 'yaml';
const o = YAML.parse(fs.readFileSync('src/兽血沸腾/故事大纲.yaml', 'utf8'));
const 名 = process.argv[2];
const cs = o.characters ?? [];
console.log(`characters 共 ${cs.length}`);
let n = 0;
for (const c of cs) {
  const nm = c.姓名 ?? c.name ?? c.名 ?? '';
  if (!String(nm).includes(名)) continue;
  n++;
  console.log(`\n──── ${JSON.stringify(c).slice(0, 2400)}`);
}
console.log(`\n命中 ${n} 条`);
