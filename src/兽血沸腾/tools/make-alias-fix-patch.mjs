// 清除臆造别名：`索菲亚` 这个词在 13.6 MB 原文里出现 0 次，
// `费雯丽.李` / `米娅.哈姆`（ASCII 点形）同样 0 次。
// 这些词当初被写进 NPC 条目的 keywords 与 strategy.keys，是凭空多出来的检索入口，
// 永远匹配不到任何原文，还会污染关键词表。这里逐条替换回原文真实写法。
//
// 米娅 的原文写法是「米娅·哈姆」（中点，1 次），故关键用中点形。
import fs from 'fs';

const P = 'src/兽血沸腾/tools/patch-alias-fix.json';

const 修正 = [
  ['巢农主母', ['巢农主母']],
  ['幽月儿', ['幽月儿']],
  ['明姚', ['明姚']],
  ['费雯丽', ['费雯丽']],
  ['赫莲娜', ['赫莲娜']],
  ['米娅', ['米娅', '米娅·哈姆']],
];

const ops = [];
for (const [名, kw] of 修正) {
  ops.push({ op: 'replace', path: `/entryManifest/NPC/${名}/keywords`, value: kw });
  ops.push({ op: 'replace', path: `/entryManifest/NPC/${名}/strategy/keys`, value: kw });
}

fs.writeFileSync(P, JSON.stringify(ops, null, 2), 'utf8');
console.log(`✓ ${ops.length} 个 op → ${P}`);
for (const [名, kw] of 修正) console.log(`  NPC/${名}: ${JSON.stringify(kw)}`);
