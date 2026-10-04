import fs from 'fs';
const ms = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-milestones.json', 'utf8'));
const 人 = ['刘震撼','海伦.列娜','崔蓓茜','艾薇尔','卡鲁','托蒂伯爵','若尔娜','茉儿','歌莉妮','艾弗森','谭雅'];
for (const n of 人) {
  const rows = ms[n] ?? [];
  console.log(`\n════ ${n}（${rows.length} 条里程碑）════`);
  for (const r of rows) console.log(`  idx${r.idx} ${r.章} :: ${(r.摘||'').slice(0,110)}`);
}
