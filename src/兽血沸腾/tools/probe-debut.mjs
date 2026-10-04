import fs from 'node:fs';
const t = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-table.json', 'utf8'));
const 表 = t.表 ?? t;
const want = process.argv.slice(2);
for (const w of want) {
  const hit = 表.filter(r => r.名 === w || r.命中名 === w);
  if (!hit.length) { console.log(`${w.padEnd(14)} 未收录`); continue; }
  for (const r of hit) console.log(`${w.padEnd(14)} 登场=${String(r.登场).padStart(4)}  类型=${r.类型}  文件=${r.文件}`);
}
