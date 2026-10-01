import fs from 'fs';
const q = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/demote-queue.json', 'utf8'));
const 只看 = process.argv[2];
for (const f of [...new Set(q.map(x => x.文件))]) {
  if (只看 && !f.includes(只看)) continue;
  const arr = q.filter(x => x.文件 === f);
  console.log(`\n════════ ${f}（${arr.length} 处）════════`);
  for (const x of arr) {
    console.log(`  L${x.行} [${x.桶}] ${x.节}/${x.键} 登场=${x.登场} 建议下界=${x.建议下界}`);
    console.log(`      ${x.文}`);
  }
}
