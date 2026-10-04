// 探针：把审计范围从 keywords 扩到「条目名」本身，并复核两个残留分歧。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 数 = s => 原.split(s).length - 1;
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

console.log('══ 分歧复核 ══');
for (const w of ['克里斯蒂安', '克里斯蒂安·维埃里', '维埃里', '维黑子', '克里斯蒂安.维埃里']) {
  console.log(`   ${w.padEnd(18)} → ${String(数(w)).padStart(4)}`);
}
console.log('\n   「克里斯蒂安」出现的行（前 8）：');
let c = 0;
原.split('\n').forEach((l, i) => { if (c < 8 && l.includes('克里斯蒂安')) { console.log(`      L${i + 1}: ${l.trim().slice(0, 100)}`); c++; } });
console.log('\n   「维黑子」出现的行（前 4）：');
c = 0;
原.split('\n').forEach((l, i) => { if (c < 4 && l.includes('维黑子')) { console.log(`      L${i + 1}: ${l.trim().slice(0, 100)}`); c++; } });

console.log('\n\n══ 条目名本身的幽灵扫描（人名类）══');
const 名幽灵 = [];
for (const 类型 of ['角色', 'NPC']) {
  for (const 名 of Object.keys(st.entryManifest[类型] ?? {})) {
    // 条目名常带 `_基础信息` 之类后缀，剥掉再查
    const 核 = 名.replace(/_(基础信息|性格调色盘|三面性|二次解释|私密档案|私密阶段)$/, '');
    if (核.length < 2) continue;
    // 常驻条目（constant）不参与匹配，跳过
    const leaf = st.entryManifest[类型][名];
    if (leaf.strategy?.type === 'constant') continue;
    if (数(核) === 0) 名幽灵.push(`${类型} / ${名}`);
  }
}
console.log(`   原文 0 命中的条目名：${名幽灵.length} 个`);
for (const g of 名幽灵) console.log(`   ✗ ${g}`);

console.log('\n\n══ 「点号前缀短词」全量复查（旧 bug 产物）══');
// 旧实现 `p.split(/[.·]/)[0]` 会从 `克里斯蒂安·维埃里` 造出 `克里斯蒂安`，
// 从 `大卫·贝克汉姆` 造出 `大卫`。这类词脱离全名后指向不明，逐个列出待判。
const 短词 = [];
for (const 类型 of ['角色', 'NPC']) {
  for (const [名, leaf] of Object.entries(st.entryManifest[类型] ?? {})) {
    for (const k of new Set([...(leaf.keywords ?? []), ...(leaf.strategy?.keys ?? [])])) {
      if (!k.includes('.') && !k.includes('·')) continue;
      短词.push(`${类型} / ${名}  →  「${k}」`);
    }
  }
}
console.log(`   含分隔符的关键词：${短词.length} 个`);
for (const s of 短词) console.log(`   ${s}`);
