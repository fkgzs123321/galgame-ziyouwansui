import fs from 'fs';
const a = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/demote-thresholds.json', 'utf8'));
for (const r of a.filter(x => x.桶 === '身份类')) {
  console.log(`════ ${r.名}  ${r.节 ? r.节 + '/' : ''}${r.键}  L${r.行}  建议下界=${r.建议下界 ?? '空'}${r.有未来词 ? ' 未来词' : ''}`);
  console.log(`   文: ${r.文}`);
  console.log(`   锚: ${r.锚.map(x => `${x.词}=${x.首idx ?? '无'}`).join('  ') || '（无）'}`);
}
