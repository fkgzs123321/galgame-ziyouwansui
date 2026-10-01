// 把「汉字·汉字」的中文点用法按完整姓名 token 提取，并逐个与原文核对。
import fs from 'fs';
import path from 'path';

const raw = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');

// 在源文里统计两种写法
const count = (s) => raw.split(s).length - 1;

const ROOTS = ['src/兽血沸腾/世界书', 'src/兽血沸腾/开场白'];
const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(yaml|txt|md)$/.test(e.name)) files.push(p);
  }
};
ROOTS.forEach(walk);

// 完整姓名 token：连续汉字/点在 2~12 字且含点，且不是「第X章」类标题
const tokens = new Map();
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/([\u4e00-\u9fa5]{1,6}·[\u4e00-\u9fa5]{1,6}(?:·[\u4e00-\u9fa5]{1,6})?)/g)) {
    const tok = m[1];
    // 排除章节/篇名分隔（前后是 章/篇/岛/原/上/期/横/村 等结构词）
    if (/^(第[一二三四五六七八九十百零]+[章篇节])/.test(tok)) continue;
    if (/^[章篇岛原上期横村]·|·[第]/.test(tok)) continue;
    if (!tokens.has(tok)) tokens.set(tok, new Set());
    tokens.get(tok).add(f.replace(/\\/g, '/').replace('src/兽血沸腾/', ''));
  }
}

console.log('══ 卡内出现的「汉字·汉字」完整姓名 token 与原文比对 ══\n');
console.log('姓名'.padEnd(20) + '文中·写法'.padEnd(12) + '文中.写法'.padEnd(12) + '判定');
console.log('─'.repeat(72));
let bad = 0;
for (const [tok, fs_] of [...tokens].sort()) {
  const dot = tok.replace(/·/g, '.');
  const c1 = count(tok), c2 = count(dot);
  let verdict;
  if (c2 === 0 && c1 === 0) verdict = '⚠ 原文两写法皆无';
  else if (c2 > c1) verdict = `✗ 应为 . （原文 ${c2}）`;
  else if (c1 > c2) verdict = `✓ 原文作 · （${c1} 处）`;
  else verdict = `= 两写法各 ${c1}`;
  if (verdict.startsWith('✗') || verdict.startsWith('⚠')) bad++;
  console.log(`${tok.padEnd(20)}${String(c1).padEnd(12)}${String(c2).padEnd(12)}${verdict}`);
  if (verdict.startsWith('✗')) console.log(`   出现在: ${[...fs_].slice(0, 5).join('  ')}${fs_.size > 5 ? ` …共${fs_.size}` : ''}`);
}
console.log(`\n需修 ${bad} 个 token`);
