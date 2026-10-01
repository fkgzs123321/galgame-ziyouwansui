// 对照：修正后的 make-npc-patch.mjs 生成的关键词 vs 当前 state 里已修好的关键词。
// 目的：确认根因修复后重跑生成器是**幂等**的，不会把 18 处缺陷写回来。
import fs from 'fs';

const ops = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/patch-npc.json', 'utf8'));
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

const 生成 = {};
for (const op of ops) {
  if (op.op !== 'add' || !op.value) continue;
  const m = op.path?.match(/^\/entryManifest\/NPC\/(.+)$/);
  if (m) 生成[m[1]] = op.value.keywords;
}

let 同 = 0;
const 异 = [];
for (const [名, kw] of Object.entries(生成)) {
  const 现 = st.entryManifest.NPC[名]?.keywords;
  if (!现) { 异.push(`? ${名} state 里不存在`); continue; }
  if (JSON.stringify(现) === JSON.stringify(kw)) 同++;
  else 异.push(`${名}\n     state  ：${现.join(' / ')}\n     生成器：${kw.join(' / ')}`);
}

console.log(`══ 生成器产出 ${Object.keys(生成).length} 个 NPC 条目 ══`);
console.log(`   与 state 完全一致：${同}`);
console.log(`   有差异：${异.length}`);
for (const d of 异) console.log(`   ✗ ${d}`);

// 生成器产出的关键词里有没有原文 0 命中的
const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 坏 = [];
for (const [名, kw] of Object.entries(生成)) {
  for (const k of kw) if (!原.includes(k) && k !== 名) 坏.push(`${名} → 「${k}」`);
}
console.log(`\n══ 生成器产出的关键词里原文 0 命中（本名除外）：${坏.length} 个 ══`);
for (const b of 坏) console.log(`   ✗ ${b}`);
