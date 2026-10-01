import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书/角色';
const state = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const manifest = state.entryManifest['角色'] || {};

console.log('══ manifest 键样例 ══');
console.log(Object.keys(manifest).slice(0, 8).join('\n'));

// 按磁盘子目录归组（最可靠）
const dirs = fs.readdirSync(ROOT, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const four = ['基础信息', '性格调色盘', '三面性', '二次解释', '私密', '私密阶段'];
const rows = [];
for (const d of dirs) {
  const files = fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith('.yaml')).map((f) => f.replace('.yaml', ''));
  rows.push({ d, files });
}
const has = (r, f) => r.files.includes(f);

console.log('\n══ 条目集分布 ══');
const groups = {};
for (const r of rows) {
  const sig = four.filter((f) => has(r, f)).join('+') || '(空)';
  (groups[sig] ||= []).push(r.d);
}
for (const [sig, list] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n【${sig}】${list.length} 人`);
  console.log('  ' + list.join('、'));
}

console.log('\n══ 交叉表 ══');
const c = (f) => rows.filter((r) => has(r, f)).length;
for (const f of four) console.log(`  ${f.padEnd(8)} ${String(c(f)).padStart(3)} / ${rows.length} 人`);
console.log(`\n  basic 必须有(threshold 5, required) → 实有 ${c('基础信息')} 人`);
console.log(`  私密 只在名单内            → 实有 ${c('私密')} 人`);
console.log(`  私密阶段 只在名单内          → 实有 ${c('私密阶段')} 人`);
const both = rows.filter((r) => has(r, '私密') && has(r, '私密阶段')).map((r) => r.d);
const onlyOne = rows.filter((r) => has(r, '私密') !== has(r, '私密阶段')).map((r) => r.d);
console.log(`  两件都有的              → ${both.length} 人`);
console.log(`  只有其一的              → ${onlyOne.length} 人 ${onlyOne.join('、') || '(无)'}`);
