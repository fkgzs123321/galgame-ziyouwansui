// 探针：条目关键词 / 别名里有没有「原文查无此词」的幽灵名。
//
// 背景：关键词是运行期的检索入口。写一个原文从不出现的字串，等于给条目挂一个
// 永远匹配不到东西的钩子，还污染整张关键词表。判例见 `术语纪律.md` 的
// 「关键词 / 别名必须是原文真有的字串」条（`索菲亚` 整本 0 命中，
// `谭雅.玛索` 0 命中，ASCII 点形 `米娅.哈姆` 0 命中）。
//
// 这里把每个条目的 keywords + strategy.keys 全量抽出来，逐个去原文精确检索。
// 仅报 0 命中的；命中数为小数字的（1~2）另列「冷门」供人工确认，不算违规。
import fs from 'fs';
import path from 'path';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const S = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

const 条目 = S.entryManifest ?? S.entry_manifest ?? {};
// 只有「人名/地名类」条目才适用「必须是原文真有的字串」。
// 世界观/扮演准则/时间线/MVU 这类条目名是**组合式索引标题**（如「世界总览」
// 「战歌名录」「叙事准则」），本来就不该在原文里出现，不算幽灵。
//
// 另外 `strategy.type === 'constant'` 的条目（如 角色速览，scope: catalog）
// 是常驻注入的，keywords 根本不参与匹配，其中的词自然可以是索引标题。
const 人名类 = new Set(['角色', 'NPC']);
const 幽灵 = [];
const 冷门 = [];
const 索引标题 = [];
const 常驻 = [];
let 总词 = 0, 总条目 = 0;

for (const [类型, 表] of Object.entries(条目)) {
  for (const [名, leaf] of Object.entries(表)) {
    总条目++;
    const 常驻条目 = leaf.strategy?.type === 'constant';
    const 词 = new Set();
    for (const k of leaf.keywords ?? []) 词.add(k);
    for (const k of leaf.strategy?.keys ?? []) 词.add(k);
    for (const k of 词) {
      总词++;
      if (typeof k !== 'string' || !k.trim()) continue;
      const n = 原.split(k).length - 1;
      if (n === 0) {
        if (常驻条目) 常驻.push({ 类型, 名, 词: k });
        else if (人名类.has(类型)) 幽灵.push({ 类型, 名, 词: k });
        else 索引标题.push({ 类型, 名, 词: k });
      } else if (n <= 2) 冷门.push({ 类型, 名, 词: k, n });
    }
  }
}

console.log(`══ 扫描 ${总条目} 个条目、${总词} 个关键词（去重前）══\n`);

if (幽灵.length) {
  console.log(`✗ 人名类条目里原文 0 命中的关键词（必须清退或改回本名）：${幽灵.length} 个`);
  for (const g of 幽灵) console.log(`   【${g.类型}】${g.名}  →  「${g.词}」`);
} else {
  console.log('✓ 人名类条目（角色/NPC）里没有原文 0 命中的关键词');
}

console.log(`\n· 组合式索引标题（世界观/准则/时间线等，0 命中属正常）：${索引标题.length} 个`);
for (const g of 索引标题) console.log(`   【${g.类型}】${g.名}  →  「${g.词}」`);

console.log(`\n· 常驻条目（strategy: constant，keywords 不参与匹配）：${常驻.length} 个`);
for (const g of 常驻) console.log(`   【${g.类型}】${g.名}  →  「${g.词}」`);

console.log(`\n· 冷门（原文仅 1~2 次命中，非违规，供确认）：${冷门.length} 个`);
const 按词 = {};
for (const c of 冷门) (按词[c.词] ??= []).push(`${c.名}(${c.n})`);
for (const [w, xs] of Object.entries(按词).sort((a, b) => a[1].length - b[1].length)) {
  console.log(`   ${w} ×${xs.length}`);
}
