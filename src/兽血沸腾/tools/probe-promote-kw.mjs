// 对比 A 组 8 人「现有 NPC 条目关键词」与「拟注册 角色 条目关键词」，
// 确保升格后不丢任何检索词。
import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const 升格 = ['幽月儿', '加茜娅', '伦娜', '费雯丽', '朝河兰', '珍妮佛', '波姬小丝', '赫莲娜'];

const ALIAS = {
  // 只保留原文真有的写法（逐字检索确认过）。
  // 已清退：费雯丽.李 / 赫莲娜.索菲亚 / 幽月儿.索菲亚 —— `索菲亚` 全篇 0 命中，是臆造。
  幽月儿: ['幽月儿·杜垩登'],
};
function kw(名) {
  const keys = new Set([名]);
  const head = 名.split(/[.·]/)[0];
  if (head.length >= 2 && head !== 名) keys.add(head);
  (ALIAS[名] || []).forEach(k => keys.add(k));
  return [...keys].filter(k => k.length >= 2 && k.length <= 14).sort();
}

console.log('名'.padEnd(8) + 'NPC 现有关键词'.padEnd(40) + '角色 拟用关键词');
console.log('─'.repeat(110));
let 丢 = 0;
for (const 名 of 升格) {
  const e = st.entryManifest.NPC?.[名];
  const 旧 = e ? (e.keywords || []) : null;
  const 新 = kw(名);
  const miss = 旧 ? 旧.filter(k => !新.includes(k)) : [];
  if (miss.length) 丢++;
  console.log(
    名.padEnd(8) +
    String(旧 ? 旧.join(',') : '（无 NPC 条目）').padEnd(40) +
    新.join(',') +
    (miss.length ? `   ⚠ 丢失: ${miss.join(',')}` : ''),
  );
}
console.log(`\n会丢关键词的人数: ${丢}`);

// 现有 角色 关键词冲突检查（升格后新增的检索词不能被别人占用）
const 新增 = new Set(升格.flatMap(名 => kw(名)));
const 冲突 = [];
for (const [k, v] of Object.entries(st.entryManifest['角色'] || {})) {
  if (k.includes('_私密') || k.includes('_性格') || k.includes('_三面') || k.includes('_二次')) continue;
  for (const t of v.keywords || []) if (新增.has(t)) 冲突.push(`${t} 已被 ${k} 占用`);
}
console.log(`与现有 角色 条目的关键词冲突: ${冲突.length}`);
冲突.forEach(c => console.log('  ' + c));
