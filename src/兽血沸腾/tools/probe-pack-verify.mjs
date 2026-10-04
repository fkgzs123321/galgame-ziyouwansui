// 打包后核验。
import fs from 'fs';
const p = 'src/兽血沸腾/兽血沸腾.json';
const 卡 = JSON.parse(fs.readFileSync(p, 'utf8'));
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 数 = s => 原.split(s).length - 1;

const book = 卡.data.character_book.entries;
console.log(`文件大小   ${fs.statSync(p).size} B`);
console.log(`卡内条目   ${book.length}`);
console.log(`state 条目 ${Object.values(st.entryManifest).reduce((a, o) => a + Object.keys(o).length, 0)}`);
console.log(`regex      ${Object.keys(卡.data.extensions.regex_scripts ?? {}).length}`);
console.log(`tags       ${(卡.data.tags ?? []).length}`);
console.log(`开场白     ${(卡.data.alternate_greetings ?? []).length}`);

// 保罗条目
const 保 = book.filter(e => e.comment === '保罗·马尔蒂尼' || e.comment === '保罗.马尔蒂尼');
console.log(`\n── 保罗条目 ──`);
for (const e of 保) console.log(`   comment=${e.comment}  keys=${JSON.stringify(e.keys)}  content 含中点=${e.content.includes('保罗·马尔蒂尼')}`);

// 全量：卡内 comments 里含分隔符的
console.log(`\n── 卡内条目名含分隔符 ──`);
for (const e of book) {
  if (/[.·]/.test(e.comment) && !/第|卷|章|篇/.test(e.comment)) {
    console.log(`   ${e.comment.padEnd(24)} keys=${JSON.stringify(e.keys)}`);
  }
}

// 幽灵复扫：卡内所有 keys 是否原文 0 命中
console.log(`\n── 卡内 keys 幽灵复扫（人名类）──`);
let 坏 = 0;
for (const e of book) {
  const 类型 = /NPC|角色/.test(e.comment) ? 1 : 0;
  for (const k of e.keys ?? []) {
    if (数(k) === 0 && k !== e.comment) { console.log(`   ✗ ${e.comment} →「${k}」`); 坏++; }
  }
}
console.log(`   0 命中 ${坏} 个`);

// 私密条目
const 私 = book.filter(e => /私密档案|私密阶段/.test(e.comment));
console.log(`\n私密相关条目 ${私.length} 个（期望 50）`);
