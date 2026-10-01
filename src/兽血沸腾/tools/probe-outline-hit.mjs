// 只读：在 故事大纲.yaml 里检索词，报告「chapters 数组序号 → 去重章 idx」。
// 用法: node probe-outline-hit.mjs 剑桥大祭师 国王的教女
import fs from 'fs';

const L = fs.readFileSync('src/兽血沸腾/故事大纲.yaml', 'utf8').split('\n');
const start = L.findIndex(l => /^chapters:/.test(l));

// 收集每个 chapter 的起止行
const marks = [];
for (let i = start + 1; i < L.length; i++) {
  if (/^\S/.test(L[i])) break;
  const m = L[i].match(/^\s{2}- name:\s*(.*)$/);
  if (m) marks.push({ i, name: m[1].trim() });
}
// idx == chapters 数组下标（见 build-chapter-index.mjs 的论证）
const 章线 = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
const 线图 = new Map(章线.map(c => [c.idx, c.line]));

const idxOfLine = ln => {
  let k = -1;
  for (let i = 0; i < marks.length; i++) { if (marks[i].i <= ln) k = i; else break; }
  return k < 0 ? null : { 章序号: k, idx: k, 行: 线图.get(k) ?? null, 章名: marks[k].name };
};

for (const term of process.argv.slice(2)) {
  console.log(`\n═══ 「${term}」 ═══`);
  let n = 0;
  for (let i = start + 1, end = L.length; i < end; i++) {
    if (!L[i].includes(term)) continue;
    const at = idxOfLine(i);
    if (!at) continue;
    n++;
    if (n > 40) { console.log('   …（更多略）'); break; }
    console.log(`  L${i}  outline章#${at.章序号} → idx ${at.idx}  原文L${at.行}  《${at.章名}》`);
    console.log(`      ${L[i].trim().slice(0, 180)}`);
  }
  console.log(`  共 ${n} 处`);
}
