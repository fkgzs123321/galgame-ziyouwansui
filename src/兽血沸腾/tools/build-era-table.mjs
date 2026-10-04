// 建纪元表：算出每个 角色/NPC 的首次登场 dedup 章节序号。
// 名称来源 = 目录名/NPC文件名 + state 里的 keywords（别名），取最早命中。
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n');
const outline = YAML.parse(fs.readFileSync(`${PROJ}/故事大纲.yaml`, 'utf8'));
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));

// ── 建 dedup 章号映射 ──
const isHead = t => /^第[0-9A-Za-z一二三四五六七八九十百千]+章[\s　]/.test(t) || /^第[0-9A-Za-z一二三四五六七八九十百千]+章$/.test(t);
const rawHeads = [];
raw.forEach((l, i) => { const t = l.trim(); if (isHead(t)) rawHeads.push({ line: i + 1, name: t }); });
const dedupNames = outline.chapters.map(c => String(c.name || '').trim());
let j = 0; const lineToIdx = [];
for (const h of rawHeads) {
  if (j < dedupNames.length && (h.name === dedupNames[j] || dedupNames[j].includes(h.name) || h.name.includes(dedupNames[j]))) {
    lineToIdx.push({ line: h.line, idx: j, name: h.name }); j++;
  } else lineToIdx.push({ line: h.line, idx: j - 1, name: h.name, dup: true });
}
const idxForLine = ln => { let cur = -1; for (const e of lineToIdx) { if (e.line <= ln) cur = e.idx; else break; } return cur; };

// ── 卷区间（dedup idx） ──
const VOLS = [
  { 卷: '荒岛篇', 起: 0, 止: 8 }, { 卷: '胸罩岛篇', 起: 9, 止: 20 },
  { 卷: '海上篇', 起: 21, 止: 30 }, { 卷: '多瑙大荒原篇', 起: 31, 止: 42 },
  { 卷: '博格村与领地初建', 起: 43, 止: 58 }, { 卷: '翡冷翠领主期', 起: 59, 止: 72 },
  { 卷: '比蒙王国纵横', 起: 73, 止: 763 },
];
const 卷of = i => (VOLS.find(v => i >= v.起 && i <= v.止) || {}).卷 ?? '?';

// ── 收集每个对象的候选名 ──
const 别名 = (类型, 名) => {
  const leaf = st.entryManifest[类型]?.[名] ?? st.entryManifest[类型]?.[名 + '_基础信息'];
  const ks = [];
  if (leaf?.keywords) ks.push(...leaf.keywords);
  if (leaf?.strategy?.keys) ks.push(...leaf.strategy.keys);
  return ks.filter(k => k.length >= 2 && /^[\u4e00-\u9fa5.\u00b7A-Za-z]{2,}$/.test(k));
};

const 目标 = [];
const 角色DIR = `${PROJ}/世界书/角色`;
for (const d of fs.readdirSync(角色DIR, { withFileTypes: true })) {
  if (d.isDirectory()) 目标.push({ 类型: '角色', 名: d.name });
}
for (const f of fs.readdirSync(`${PROJ}/世界书/NPC`)) {
  if (f.endsWith('.yaml')) 目标.push({ 类型: 'NPC', 名: f.replace(/\.yaml$/, '') });
}

// ── 求首次命中行 ──
const 行含 = new Map();
const 首行 = c => {
  if (行含.has(c)) return 行含.get(c);
  let r = -1;
  for (let i = 0; i < raw.length; i++) if (raw[i].includes(c)) { r = i + 1; break; }
  行含.set(c, r); return r;
};

const 表 = [];
for (const t of 目标) {
  const cs = [t.名, ...别名(t.类型, t.名)];
  let best = -1, bestC = '';
  for (const c of cs) { const l = 首行(c); if (l > 0 && (best < 0 || l < best)) { best = l; bestC = c; } }
  const idx = best > 0 ? idxForLine(best) : -1;
  表.push({ ...t, 行: best, 命中名: bestC, 登场: idx, 卷: idx >= 0 ? 卷of(idx) : '未命中', 候选数: cs.length });
}

const out = `${PROJ}/tools/era-table.json`;
fs.writeFileSync(out, JSON.stringify(表, null, 1), 'utf8');
console.log(`✓ ${表.length} 个对象 → ${out}\n`);

const 未 = 表.filter(x => x.登场 < 0);
console.log(`未命中源文：${未.length} 个`);
if (未.length) console.log('   ' + 未.map(x => `${x.类型}/${x.名}`).join('、'));

console.log('\n══ 按登场章分布 ══');
const 桶 = {};
for (const x of 表) { const k = x.登场 < 0 ? '未命中' : 卷of(x.登场); 桶[k] = (桶[k] || 0) + 1; }
for (const v of VOLS) console.log(`   ${v.卷.padEnd(14)} ${String(桶[v.卷] || 0).padStart(4)}`);
if (桶['未命中']) console.log(`   未命中          ${桶['未命中']}`);

console.log('\n══ 已知锚点核对 ══');
const 锚 = { '海伦.列娜': 2, '凝玉': 21, '艾薇尔': 24, '崔蓓茜': 15, '歌坦妮': 94, '若尔娜': 145,
  '黛丝': 133, '贞德': 59, '白素青': 241, '谭雅': 340, '阿仙奴': 104, '许德拉': 60, '歌莉妮': 60,
  '唐蓓尔金娜': 70, '梦露': 300, '嘉宝': 520, '艾莉婕': 200, '幽月儿': 260, '加茜娅': 176,
  '伦娜': 278, '费雯丽': 245, '朝河兰': 708, '珍妮佛': 140, '波姬小丝': 623, '赫莲娜': 210,
  '安瑞达': 464, '喀秋莎': 71, '海华丝': 588, '罗德曼': 121, '永贝里': 105, '依莎贝拉': 588,
  '波利斯': 716, '迦莎': 477, '切赫': 465, '菲高': 29, '罗纳尔迪尼奥': 226, '埃托奥': 406,
  '明姚': 427, '保罗·马尔蒂尼': 185, '席尔维斯特': 483, '阿杜': 107, '布拉特': 144 };
for (const [n, a] of Object.entries(锚)) {
  const r = 表.find(x => x.名 === n);
  if (!r) { console.log(`   ${n.padEnd(14)} (表里没有)`); continue; }
  const d = r.登场 - a;
  const flag = Math.abs(d) <= 3 ? '✓' : (Math.abs(d) <= 15 ? '~' : '✗');
  console.log(`   ${flag} ${n.padEnd(14)} 表=${String(r.登场).padStart(4)} 锚=${String(a).padStart(4)} 差=${String(d).padStart(5)}  命中「${r.命中名}」`);
}
