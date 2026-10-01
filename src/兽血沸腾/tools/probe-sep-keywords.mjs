// 复查：所有含分隔符的关键词/条目名是否都原文真有的字串。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 数 = s => 原.split(s).length - 1;
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

const 坏 = [];
let 总 = 0;
for (const 类型 of ['角色', 'NPC']) {
  for (const [名, leaf] of Object.entries(st.entryManifest[类型] ?? {})) {
    if (leaf.strategy?.type === 'constant') continue;
    const 核 = 名.replace(/_(基础信息|性格调色盘|三面性|二次解释|私密档案|私密阶段)$/, '');
    const 词 = new Set([核, ...(leaf.keywords ?? []), ...(leaf.strategy?.keys ?? [])]);
    for (const k of 词) {
      if (!/[.·]/.test(k)) continue;
      总++;
      const n = 数(k);
      if (n === 0) 坏.push([类型, 名, k]);
    }
  }
}
console.log(`══ 含分隔符的条目名/关键词 ${总} 个（去重前），原文 0 命中 ${坏.length} 个 ══`);
for (const [t, n, k] of 坏) console.log(`   ✗ 【${t}】${n}  →「${k}」`);

// 逐个数一遍命中，供留档
console.log('\n── 逐个原文命中数 ──');
const 全 = new Set();
for (const 类型 of ['角色', 'NPC']) {
  for (const [名, leaf] of Object.entries(st.entryManifest[类型] ?? {})) {
    if (leaf.strategy?.type === 'constant') continue;
    const 核 = 名.replace(/_(基础信息|性格调色盘|三面性|二次解释|私密档案|私密阶段)$/, '');
    for (const k of new Set([核, ...(leaf.keywords ?? []), ...(leaf.strategy?.keys ?? [])])) {
      if (/[.·]/.test(k)) 全.add(k);
    }
  }
}
for (const k of [...全].sort()) console.log(`   ${k.padEnd(26)} ${数(k)}`);
