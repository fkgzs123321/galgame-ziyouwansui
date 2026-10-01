// 精确提取卡内的人名（含分隔符），并在原文里核对两种写法。
// 做法：对卡内每个「·」取其最大汉字串，再逐步向内收缩，取原文有命中的最长形式作为真实姓名。
import fs from 'fs';
import path from 'path';
const raw = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const cnt = s => raw.split(s).length - 1;

const ROOTS = ['src/兽血沸腾/世界书', 'src/兽血沸腾/开场白'];
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/\.(yaml|txt|md)$/.test(e.name)) files.push(p);
  }
})(ROOTS[0]);
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/\.(yaml|txt|md)$/.test(e.name)) files.push(p);
  }
})(ROOTS[1]);

// 卡内所有含 · 的候选串（取 · 两侧各最多 6 个汉字）
const cand = new Set();
const where = new Map();
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/[\u4e00-\u9fa5]{1,6}·[\u4e00-\u9fa5]{1,6}(?:·[\u4e00-\u9fa5]{1,6})?/g)) {
    cand.add(m[0]);
    if (!where.has(m[0])) where.set(m[0], new Set());
    where.get(m[0]).add(f.replace(/\\/g, '/').replace('src/兽血沸腾/', ''));
  }
}

// 收缩到原文有命中的最长真实姓名
const real = new Map(); // 卡内写法 -> {len, canonical}
for (const c of cand) {
  let best = null;
  // 允许从左侧裁、从右侧裁
  for (let l = 0; l <= 6 && !best; l++) {
    for (let r = 0; r <= 6 && !best; r++) {
      const s = c.slice(l, c.length - r);
      if (!s.includes('·')) continue;
      if (/^[一二三四五六七八九十百零第章篇节至]/.test(s)) continue;
      const cDot = cnt(s), cMid = cnt(s.replace(/·/g, '.'));
      if (cDot + cMid > 0 && s.split('·').length === c.split('·').length) best = { s, cDot, cMid };
    }
  }
  if (best) real.set(best.s, { ...best, where: where.get(c) });
}

console.log('══ 卡内人名 vs 原文写法 ══\n');
console.log('卡内写法'.padEnd(22) + '·处'.padEnd(6) + '.处'.padEnd(6) + '裁定');
console.log('─'.repeat(62));
const toDot = [], toMid = [], tie = [];
for (const [s, v] of [...real].sort((a, b) => b[1].cDot + b[1].cMid - (a[1].cDot + a[1].cMid))) {
  let verdict;
  if (v.cMid > v.cDot) { verdict = `→ 应改 .  (原文 ${v.cMid} : ${v.cDot})`; toDot.push(s); }
  else if (v.cDot > v.cMid) { verdict = `→ 应改 ·  (原文 ${v.cDot} : ${v.cMid})`; toMid.push(s); }
  else { verdict = `= 平手 ${v.cDot}`; tie.push(s); }
  console.log(`${s.padEnd(22)}${String(v.cDot).padEnd(6)}${String(v.cMid).padEnd(6)}${verdict}`);
}
console.log(`\n改 . : ${toDot.length} 个\n改 · : ${toMid.length} 个\n平手 : ${tie.length} 个`);
console.log('\n── 需改为 ASCII . 的清单 ──');
toDot.forEach(s => console.log(`   ${s}  →  ${s.replace(/·/g, '.')}   出现在 ${[...real.get(s).where].join(' / ')}`));
console.log('\n── 需改为中点 · 的清单 ──');
toMid.forEach(s => console.log(`   ${s}  →  ${s.replace(/\./g, '·')}   出现在 ${[...real.get(s).where].join(' / ')}`));
console.log('\n── 平手（保持卡内现状即可） ──');
tie.forEach(s => console.log(`   ${s}  (${[...real.get(s).where].join(' / ')})`));
