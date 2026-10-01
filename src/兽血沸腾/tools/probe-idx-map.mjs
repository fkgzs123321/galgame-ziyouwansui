// 只读：验证「outline chapters 数组下标 k」与「去重章 idx」的映射方式。
// 三个候选：
//   A) idx = lineToIdx[k].idx                （按下标对应，假设 764↔764）
//   B) 按标题在原文里找同名标题，取其 idx     （内容对应）
// 用原文标题行文本核对。
import fs from 'fs';

const TXT = 'src/兽血沸腾/兽血沸腾.txt';
const raw = fs.readFileSync(TXT, 'utf8').split('\n');
const lineToIdx = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/line-to-idx.json', 'utf8'));

const 标题 = ln => {
  let s = raw[ln - 1].replace(/^\uFEFF/, '').trim();
  return s.replace(/^第[零一二三四五六七八九十百千两]+章[章\s　]*/, '').replace(/[{｛][^}｝]*[}｝]/g, '').trim();
};
const 净 = s => s.replace(/^第[零一二三四五六七八九十百千两]+章[章\s　]*/, '').replace(/[{｛][^}｝]*[}｝]/g, '').trim();

// 建 净标题 → idx（首个）
const byName = new Map();
for (const r of lineToIdx) {
  const n = 标题(r.line);
  if (!byName.has(n)) byName.set(n, r.idx);
}

const L = fs.readFileSync('src/兽血沸腾/故事大纲.yaml', 'utf8').split('\n');
const start = L.findIndex(l => /^chapters:/.test(l));
const chaps = [];
for (let i = start + 1; i < L.length; i++) {
  if (/^\S/.test(L[i])) break;
  const m = L[i].match(/^\s{2}- name:\s*(.*)$/);
  if (m) chaps.push(m[1].trim());
}
console.log(`outline chapters ${chaps.length} 项；lineToIdx ${lineToIdx.length} 项（去重 idx 上限 ${Math.max(...lineToIdx.map(r=>r.idx))}）`);

let okA = 0, okB = 0, missB = 0;
const 样本 = [];
for (let k = 0; k < chaps.length; k++) {
  const a = lineToIdx[k]?.idx;
  const b = byName.get(净(chaps[k]));
  if (b !== undefined) okB++; else missB++;
  if (a === b) okA++;
  if (k % 90 === 0 || k === chaps.length - 1) 样本.push({ k, 名: chaps[k], A: a, B: b });
}
console.log(`A（按下标）与 B（按标题）一致: ${okA} / ${chaps.length}`);
console.log(`B 命中: ${okB}；B 未命中: ${missB}`);
console.log('\n抽样 k / 标题 / A / B:');
for (const s of 样本) console.log(`  k=${String(s.k).padStart(3)} A=${String(s.A).padStart(3)} B=${String(s.B).padStart(3)}  ${s.名}`);

// 关键锚点
console.log('\n关键锚点（B 口径）:');
for (const nm of ['剑桥大祭师', '挥刀问情', '翡冷翠领主', '大结局{下}']) {
  const k = chaps.findIndex(c => 净(c) === nm);
  console.log(`  《${nm}》 k=${k} → B=${byName.get(nm)}  A=${lineToIdx[k]?.idx}`);
}
