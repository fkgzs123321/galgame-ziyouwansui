// 量化真正的「前向剧透」：把 NPC 名首次出现在原文的位置，与它关系段里最晚锚点的位置比对。
// 只有 锚点晚于首次登场 才是真泄漏；首次登场本身就很晚的 NPC，条目自然也只在后期被检索到。
import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');

// 章节标题行号（用于把行号换算成去重章序号）
const heads = [];
lines.forEach((l, i) => { if (/^第[一二三四五六七八九十百零〇\d]+章\s/.test(l.trim())) heads.push(i); });
const chapOf = ln => { let c = 0; for (const h of heads) { if (h <= ln) c++; else break; } return c - 1; };
console.log(`章节标题 ${heads.length} 个；总行 ${lines.length}`);

const ANCH = ['被遗忘国度', '遗忘历', '介丘', '花王', '花相', '花廷', '巫妖王', '恐惧魔王', '教宗',
  '圣奇奥', '采玉城', '海加尔', '龙禁卫', '摄政', '加冕', '太保团', '航空兵', '海神岛', '佛巨人',
  '灰矮人', '山丘之王', '花精灵', '战死', '阵亡', '称帝', '皇后', '登基', '巫妖女王', '星界', '梦界',
  '魔界', '龙城', '摩韶', '卢塞恩', '翡冷翠', '神曲萨满', '大结局'];
const at = {};
for (const k of ANCH) { const i = lines.findIndex(l => l.includes(k)); at[k] = i < 0 ? null : i; }

const rows = [];
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml'))) {
  const n = f.replace(/\.yaml$/, '');
  const t = fs.readFileSync(path.join(NPC, f), 'utf8');
  const seg = t.split(/\n(?=语言特征:)/)[0];
  const hits = ANCH.filter(k => at[k] !== null && seg.includes(k));
  if (!hits.length) continue;
  // 最晚锚点
  const worst = hits.sort((a, b) => at[b] - at[a])[0];
  const aLn = at[worst], aCh = chapOf(aLn);
  // 首次登场：优先用别名表里的多种写法
  const nm = (t.match(/^  姓名: (.*)$/m) || [, n])[1];
  const cands = [...new Set([n, ...nm.split(/又称/).map(s => s.trim().split(/[，,]/)[0])])]
    .filter(x => x.length >= 2).sort((a, b) => b.length - a.length);
  let fLn = -1, which = '';
  for (const c of cands) { const i = lines.findIndex(l => l.includes(c)); if (i >= 0 && (fLn < 0 || i < fLn)) { fLn = i; which = c; } }
  if (fLn < 0) continue;
  const gap = aCh - chapOf(fLn);
  if (gap > 0) rows.push({ n, which, aCh, aLn: chapOf(fLn), gap, worst });
}
rows.sort((a, b) => b.gap - a.gap);
console.log(`\n真前向泄漏 ${rows.length} 个（锚点章晚于首次登场章）\n`);
console.log('  跨度  首次登场  锚点章  NPC');
for (const r of rows.slice(0, 40)) console.log(`  ${String(r.gap).padStart(4)}  ${String(r.aLn).padStart(6)}  ${String(r.aCh).padStart(5)}  ${r.n.padEnd(22)} ${r.worst}`);
console.log(`\n跨度分布: >200 章 ${rows.filter(r => r.gap > 200).length} · 100-200 ${rows.filter(r => r.gap > 100 && r.gap <= 200).length} · 50-100 ${rows.filter(r => r.gap > 50 && r.gap <= 100).length} · <=50 ${rows.filter(r => r.gap <= 50).length}`);
