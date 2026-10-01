import fs from 'fs';
import YAML from 'yaml';

const plan = YAML.parse(fs.readFileSync('src/兽血沸腾/创作规划.yaml', 'utf8'));
const chs = plan.characters || [];
console.log('创作规划.yaml characters: ' + chs.length);
const roleDir = fs.readdirSync('src/兽血沸腾/世界书/角色', { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);

console.log('\n══ characters[] 每项结构（第 1 项）══');
console.log(JSON.stringify(chs[0], null, 2).slice(0, 900));

console.log('\n══ 有 stages 的人数（=多阶段=有调色盘）══');
let withStages = 0, noStages = 0;
const names = [];
for (const c of chs) {
  const st = c.personality?.stages;
  if (Array.isArray(st) && st.length) { withStages++; names.push(c.name); } else noStages++;
}
console.log('  有 stages: ' + withStages);
console.log('  无 stages: ' + noStages);
console.log('  有 stages 的名单: ' + names.join('、'));

console.log('\n══ 在 characters[] 但磁盘上无目录的人 ══');
const missing = names.filter((n) => !roleDir.includes(n));
console.log('  ' + (missing.join('、') || '(无)'));

console.log('\n══ ejs.entries 里的 stages 数 ══');
const ejs = plan.ejs?.entries || [];
for (const e of ejs) if (e.name && /调色盘|私密/.test(e.name)) console.log(`  ${e.name}: stages=${(e.stages || []).length}`);
