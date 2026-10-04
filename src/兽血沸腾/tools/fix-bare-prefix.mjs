// 清退「裸前缀」里会撞名的两个。
//
// 判据：关键词必须能指认这个人。下面两个词指认不了：
//   `保罗`       ← `保罗·马尔蒂尼`。原文 237 行里 105 行是**另一个 NPC**
//                  「保罗纽曼」（深渊界左岸天王）、86 行是「圣保罗教」，
//                  只有 9 行指教皇本人。挂上去会把别人的楼层拉进他的条目。
//   `克里斯蒂安` ← `克里斯蒂安.维埃里`。原文 6 行里 4 行是**另一个人**
//                  「克里斯蒂安·贝尔」（第一届神魔大战的六翼天王）。
//
// 保留的裸前缀（逐个实测过，都唯一指向本人）：
//   `海伦`(2238行，全篇无第二个海伦) · `幽月儿`(115) · `克拉克`(115，100%指盖博)
//   `托蒂`(121，97%指夏尔巴伯爵) · `加图索`(133，全是龙卷风团长) ·
//   `托马西`(47，76%指丹泽圣骑士) · `福格森`(142，80%指徐) · `阿里`(136，指代伊) ·
//   `青雅`(76，全指白素青) · `米娅`(4，全指哈姆) · `乔治`(12，10 行指贝斯特)
import fs from 'fs';

const ST = 'src/兽血沸腾/tavern-cards-state.json';
const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const st = JSON.parse(fs.readFileSync(ST, 'utf8'));

// [类型, 条目名, 要清退的词, 理由]
const 清 = [
  ['NPC', '保罗·马尔蒂尼', '保罗', '237 行里 105 行是保罗纽曼、86 行是圣保罗教，仅 9 行指本人'],
  ['NPC', '维埃里', '克里斯蒂安', '6 行里 4 行是另一个六翼天王克里斯蒂安·贝尔'],
];

for (const [类型, 名, 词, 理由] of 清) {
  const leaf = st.entryManifest[类型][名];
  if (!leaf) { console.log(`✗ 缺条目 ${类型}/${名}`); continue; }
  const 前 = leaf.keywords ?? [];
  if (!前.includes(词)) { console.log(`· ${名} 本来就没有「${词}」`); continue; }
  leaf.keywords = 前.filter(k => k !== 词);
  if (leaf.strategy?.keys) leaf.strategy.keys = leaf.strategy.keys.filter(k => k !== 词);
  console.log(`✓ 【${类型}】${名}  清退「${词}」（${理由}）`);
  console.log(`     余：${leaf.keywords.join(' / ')}`);
}

fs.writeFileSync(ST, JSON.stringify(st, null, 2) + '\n', 'utf8');

console.log('\n══ 全量复查：人名类条目的关键词是否都指认得了本人 ══');
const 行 = 原.split('\n');
const 词频 = s => 原.split(s).length - 1;
const 行频 = s => 行.filter(l => l.includes(s)).length;

let 问题 = 0;
for (const 类型 of ['角色', 'NPC']) {
  for (const [名, leaf] of Object.entries(st.entryManifest[类型] ?? {})) {
    if (leaf.strategy?.type === 'constant') continue;
    const 核 = 名.replace(/_(基础信息|性格调色盘|三面性|二次解释|私密档案|私密阶段)$/, '');
    for (const k of new Set([...(leaf.keywords ?? []), ...(leaf.strategy?.keys ?? [])])) {
      const n = 词频(k);
      if (n === 0) { console.log(`   ✗ 0 命中  ${类型}/${名}  「${k}」`); 问题++; }
    }
  }
}
console.log(`   0 命中的关键词：${问题} 个`);
