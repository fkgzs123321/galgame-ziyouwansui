// 把 NPC 条目 `保罗.马尔蒂尼` 正名为原文写法 `保罗·马尔蒂尼`。
//
// 依据（术语纪律「关键词 / 别名必须是原文真有的字串」+ 分隔符裁定）：
//   原文 保罗·马尔蒂尼（中点）  5 次   → L35866 / L69142 / L78460 / L80984 / L81162
//   原文 保罗.马尔蒂尼（ASCII） 0 次
// 现状是 ASCII 点形，属「条目名/文件名/关键词」三处都用了原文从不出现的形态，
// 与 fix-name-sep.mjs 里 KEEP_MID 的裁定（`保罗·马尔蒂尼 5:0`）相抵。
// 这里把条目名、文件名、姓名行、keywords 一并改为中点形。
import fs from 'fs';
import path from 'path';

const 旧 = '保罗.马尔蒂尼';
const 新 = '保罗·马尔蒂尼';
const ST = 'src/兽血沸腾/tavern-cards-state.json';
const 旧文件 = `src/兽血沸腾/世界书/NPC/${旧}.yaml`;
const 新文件 = `src/兽血沸腾/世界书/NPC/${新}.yaml`;

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
if (!原.includes(新)) throw new Error(`原文里没有「${新}」，中止`);
if (原.includes(旧)) console.log(`⚠ 原文里也有 ASCII 点形「${旧}」`);

// 1) 改文件名
if (!fs.existsSync(旧文件)) throw new Error(`缺文件 ${旧文件}`);
if (fs.existsSync(新文件)) throw new Error(`目标已存在 ${新文件}`);
let y = fs.readFileSync(旧文件, 'utf8');
y = y.replace(`姓名: ${旧}`, `姓名: ${新}`);
fs.writeFileSync(旧文件, y, 'utf8');
fs.renameSync(旧文件, 新文件);
console.log(`✓ 文件改名  ${path.basename(旧文件)} → ${path.basename(新文件)}`);
console.log(`✓ 姓名行    ${(y.match(/^  姓名: .*$/m) || [''])[0].trim()}`);

// 2) 改 state
const st = JSON.parse(fs.readFileSync(ST, 'utf8'));
const leaf = st.entryManifest.NPC[旧];
if (!leaf) throw new Error(`state 里没有 NPC/${旧}`);
delete st.entryManifest.NPC[旧];
leaf.path = `世界书/NPC/${新}.yaml`;
leaf.keywords = [...new Set((leaf.keywords ?? []).map(k => (k === 旧 ? 新 : k)))];
if (leaf.strategy?.keys) {
  leaf.strategy.keys = [...new Set(leaf.strategy.keys.map(k => (k === 旧 ? 新 : k)))];
}
st.entryManifest.NPC[新] = leaf;
fs.writeFileSync(ST, JSON.stringify(st, null, 2) + '\n', 'utf8');
console.log(`✓ state 条目 ${旧} → ${新}`);
console.log(`   path     : ${leaf.path}`);
console.log(`   keywords : ${leaf.keywords.join(' / ')}`);
for (const k of leaf.keywords) console.log(`     ${k.padEnd(16)} 原文 ${原.split(k).length - 1} 次`);
