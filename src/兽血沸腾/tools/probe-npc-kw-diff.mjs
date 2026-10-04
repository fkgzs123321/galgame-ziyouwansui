// 探针：state 现有 NPC keywords  vs  修正后生成器产出。
//
// 目的：找出「若用生成器全量覆盖会丢掉什么」。丢掉的若是手工加的好词，
// 就要先把它并进生成器的 ALIAS 表，再覆盖；丢掉的若是幽灵词，正好清掉。
import fs from 'fs';

const ops = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/patch-npc.json', 'utf8'));
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 数 = s => 原.split(s).length - 1;

const 生成 = {};
for (const op of ops) {
  if (op.op !== 'add' || !op.value) continue;
  const m = op.path?.match(/^\/entryManifest\/NPC\/(.+)$/);
  if (m) 生成[m[1]] = op.value.keywords;
}

const 只见于state = [], 只见于生成 = [];
for (const 名 of new Set([...Object.keys(生成), ...Object.keys(st.entryManifest.NPC ?? {})])) {
  const a = new Set(st.entryManifest.NPC?.[名]?.keywords ?? []);
  const b = new Set(生成[名] ?? []);
  const sa = [...a].filter(k => !b.has(k));
  const sb = [...b].filter(k => !a.has(k));
  if (sa.length) 只见于state.push([名, sa]);
  if (sb.length) 只见于生成.push([名, sb]);
}

console.log(`══ 只见于 state（覆盖会丢）══  ${只见于state.length} 个条目`);
for (const [名, ks] of 只见于state) {
  console.log(`   ${名.padEnd(18)} ${ks.map(k => `「${k}」(${数(k)})`).join(' ')}`);
}

console.log(`\n══ 只见于生成器（覆盖会加）══  ${只见于生成.length} 个条目`);
for (const [名, ks] of 只见于生成) {
  console.log(`   ${名.padEnd(18)} ${ks.map(k => `「${k}」(${数(k)})`).join(' ')}`);
}

// 是否真有 保罗二世 与 马尔蒂尼 的关联
console.log('\n══ 「保罗二世」归属核查 ══');
const 行 = 原.split('\n');
console.log(`   「保罗二世」${数('保罗二世')} 次`);
console.log(`   同时含「保罗二世」与「马尔蒂尼」：${行.filter(l => l.includes('保罗二世') && l.includes('马尔蒂尼')).length} 行`);
console.log(`   同时含「保罗二世」与「教宗」：${行.filter(l => l.includes('保罗二世') && l.includes('教宗')).length} 行`);
console.log(`   同时含「保罗二世」与「圣保罗」：${行.filter(l => l.includes('保罗二世') && l.includes('圣保罗')).length} 行`);
console.log('   样本 3 行：');
行.filter(l => l.includes('保罗二世')).slice(0, 3).forEach(l => console.log(`      ${l.trim().slice(0, 105)}`));
