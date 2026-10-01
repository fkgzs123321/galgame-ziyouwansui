import fs from 'fs';
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
const ms = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-milestones.json', 'utf8'));
const 查 = process.argv.slice(2);
for (const n of 查) {
  console.log(`\n════ ${n} ════`);
  const rows = ms[n] ?? [];
  for (const r of rows) {
    const 摘 = r.摘 || '';
    console.log(`  idx${String(r.idx).padStart(3)} ${(r.章||'').slice(0,26).padEnd(28)} ${摘.slice(0,150)}`);
  }
}
