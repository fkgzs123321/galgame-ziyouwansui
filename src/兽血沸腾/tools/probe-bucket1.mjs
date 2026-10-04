import fs from 'fs';
const plan = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-demote-plan.json', 'utf8'));
console.log('══ 桶一：身份 / 与主角关系（须按章节分档重写）══');
for (const x of plan.身份类) {
  console.log(`\n【${x.名}】登场=${x.登场} 键=${x.键}`);
  console.log(`   现文: ${x.文}`);
}
console.log(`\n共 ${plan.身份类.length} 处，涉及 ${new Set(plan.身份类.map(x => x.名)).size} 人`);
