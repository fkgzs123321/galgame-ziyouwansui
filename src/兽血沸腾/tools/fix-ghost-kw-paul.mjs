// 单独修正 保罗.马尔蒂尼：条目名是 ASCII 点形（按分隔符裁定统一），
// 但原文只写中点形「保罗·马尔蒂尼」（5 次），ASCII 点形 0 次。
// 条目名保持裁定结果不动；keywords 是检索钩子，必须用原文真有的形态。
import fs from 'fs';

const ST = 'src/兽血沸腾/tavern-cards-state.json';
const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 数 = s => 原.split(s).length - 1;

const st = JSON.parse(fs.readFileSync(ST, 'utf8'));
const leaf = st.entryManifest.NPC['保罗.马尔蒂尼'];

const 前 = new Set(leaf.keywords ?? []);
const 删 = ['保罗.马尔蒂尼，', '保罗.马尔蒂尼'];
for (const k of 删) 前.delete(k);
前.add('保罗·马尔蒂尼');

const 后 = [...前];
const 坏 = 后.filter(k => 数(k) === 0);
if (坏.length) { console.log(`✗ 仍有 0 命中：${坏.join('、')}`); process.exit(1); }

leaf.keywords = 后;
if (leaf.strategy?.keys) leaf.strategy.keys = [...后];

fs.writeFileSync(ST, JSON.stringify(st, null, 2) + '\n', 'utf8');
console.log(`✓ 【NPC】保罗.马尔蒂尼（条目名按裁定保留 ASCII 点形）`);
console.log(`     删：${删.join('、')}`);
console.log(`     加：保罗·马尔蒂尼`);
console.log(`     得：${后.join(' / ')}`);
for (const k of 后) console.log(`       ${k.padEnd(14)} 原文 ${数(k)} 次`);
