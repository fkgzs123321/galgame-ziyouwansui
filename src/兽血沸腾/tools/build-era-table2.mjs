// 纪元表 v2：修正章标题正则（允许章号后无空格），名称只用目录名/文件名 + 条目自己的「姓名」字段。
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n');
const outline = YAML.parse(fs.readFileSync(`${PROJ}/故事大纲.yaml`, 'utf8'));

// ── 章标题（修正版：章号后空格可有可无，但整行须像标题） ──
const 净 = s => String(s).replace(/^第[0-9A-Za-z一二三四五六七八九十百千零〇两]+章[\s　]*/, '')
  .replace(/[{[（(【][^}\]）)】]*[}\]）)】]/g, '').replace(/[\s　]/g, '').trim();
const isHead = t => {
  const m = t.match(/^第[0-9A-Za-z一二三四五六七八九十百千零〇两]{1,10}章/);
  if (!m) return false;
  const rest = t.slice(m[0].length);
  if (rest.length > 44) return false;
  if (/[。！？；，、]$/.test(rest) && rest.length > 20) return false;
  return true;
};
const rawHeads = [];
raw.forEach((l, i) => { const t = l.trim(); if (isHead(t)) rawHeads.push({ line: i + 1, name: t, k: 净(t) }); });
const dedup = outline.chapters.map((c, i) => ({ i, name: String(c.name || '').trim(), k: 净(c.name) }));
const 图 = new Map();
dedup.forEach(d => { if (!图.has(d.k)) 图.set(d.k, []); 图.get(d.k).push(d.i); });

let j = 0; const pairs = [];
for (const h of rawHeads) {
  const cands = 图.get(h.k) || [];
  let pick = cands.find(c => c >= j);
  if (pick === undefined) pick = cands[cands.length - 1];
  if (pick !== undefined && pick >= j - 25) { pairs.push({ line: h.line, idx: pick }); j = pick + 1; }
}
const idxForLine = ln => { let cur = -1; for (const p of pairs) { if (p.line <= ln) cur = p.idx; else break; } return cur; };
console.log(`章映射：${pairs.length} / ${rawHeads.length} 个标题已定位`);

// ── 9 个纪元窗口（与 时间线 一致） ──
const 纪元 = [
  { 名: '荒岛篇', 起: 0, 止: 8 }, { 名: '胸罩岛篇', 起: 9, 止: 20 },
  { 名: '海上篇', 起: 21, 止: 30 }, { 名: '多瑙大荒原篇', 起: 31, 止: 42 },
  { 名: '博格村与领地初建', 起: 43, 止: 58 }, { 名: '翡冷翠领主期', 起: 59, 止: 72 },
  { 名: '纵横·成长期', 起: 73, 止: 244 }, { 名: '纵横·扩张期', 起: 245, 止: 704 },
  { 名: '纵横·终盘', 起: 705, 止: 763 },
];
const 纪元of = i => (纪元.find(v => i >= v.起 && i <= v.止) || {}).名 ?? null;

// ── 名称来源：目录名/文件名 + 条目「姓名」字段 ──
const 取值 = (t, ...keys) => {
  for (const k of keys) {
    const m = t.match(new RegExp('^\\s*' + k + ':\\s*(.+)$', 'm'));
    if (m) return m[1].trim();
  }
  return null;
};
const 拆名 = v => {
  if (!v) return null;
  let s = v.split(/[，,；;、]/)[0].trim();
  s = s.replace(/(?:绰号|小名|全名|别称|别名|又写作|又称)$/, '').trim();
  return s.length >= 2 ? s : null;
};

// 少数已核定的等价别名（保守，仅列确有依据者）
const 手动 = {
  '谭雅': ['珊瑚美人'], '古德': ['潘帅'], '白素青': ['青雅'], '崔蓓茜': ['崔蓓西'],
  '贝肯鲍尔': ['波赛东'], '梦露': ['玛丽莲'], '歌莉妮': ['莉莉'],
};

const 目标 = [];
const 角色DIR = `${PROJ}/世界书/角色`;
for (const d of fs.readdirSync(角色DIR, { withFileTypes: true })) {
  if (d.isDirectory()) 目标.push({ 类型: '角色', 名: d.name, 文件: path.join(角色DIR, d.name, '基础信息.yaml') });
}
for (const f of fs.readdirSync(`${PROJ}/世界书/NPC`)) {
  if (f.endsWith('.yaml')) 目标.push({ 类型: 'NPC', 名: f.replace(/\.yaml$/, ''), 文件: path.join(PROJ, '世界书/NPC', f) });
}

const 行含 = new Map();
const 首行 = c => { if (行含.has(c)) return 行含.get(c); let r = -1; for (let i = 0; i < raw.length; i++) if (raw[i].includes(c)) { r = i + 1; break; } 行含.set(c, r); return r; };

const 表 = [];
for (const t of 目标) {
  const txt = fs.existsSync(t.文件) ? fs.readFileSync(t.文件, 'utf8') : '';
  const 姓名 = 拆名(取值(txt, '姓名', '全名', '名字', '真名'));
  const cs = [...new Set([t.名, 姓名, ...(手动[t.名] || [])].filter(Boolean))];
  let best = -1, bestC = '', 各 = {};
  for (const c of cs) { const l = 首行(c); 各[c] = l > 0 ? idxForLine(l) : -1; if (l > 0 && (best < 0 || l < best)) { best = l; bestC = c; } }
  const idx = best > 0 ? idxForLine(best) : -1;
  表.push({ ...t, 候选: cs, 各, 行: best, 命中名: bestC, 登场: idx, 纪元: idx >= 0 ? 纪元of(idx) : null });
}

fs.writeFileSync(`${PROJ}/tools/era-table.json`, JSON.stringify({ 纪元, 表 }, null, 1), 'utf8');
console.log(`✓ ${表.length} 个对象 → tools/era-table.json`);

const 未 = 表.filter(x => x.登场 < 0);
console.log(`\n未命中：${未.length} 个` + (未.length ? '  ' + 未.map(x => `${x.类型}/${x.名}`).join('、') : ''));

console.log('\n══ 按纪元分布 ══');
for (const v of 纪元) {
  const n = 表.filter(x => x.纪元 === v.名).length;
  console.log(`   ${v.名.padEnd(12)} ${String(n).padStart(3)}`);
}

console.log('\n══ 核对其余锚点 ══');
const 锚 = { '海伦.列娜': 6, '凝玉': 27, '艾薇尔': 24, '崔蓓茜': 48, '歌坦妮': 95, '若尔娜': 146,
  '黛丝': 134, '白素青': 242, '谭雅': 341, '阿仙奴': 105, '加茜娅': 176, '伦娜': 279,
  '朝河兰': 709, '波姬小丝': 624, '赫莲娜': 211, '安瑞达': 465, '喀秋莎': 71, '海华丝': 575,
  '罗德曼': 122, '永贝里': 106, '菲高': 28, '阿杜': 107, '布拉特': 144,
  '保罗·马尔蒂尼': 185, '罗纳尔迪尼奥': 226, '埃托奥': 406, '明姚': 427, '席尔维斯特': 483,
  '依莎贝拉': 588, '波利斯': 716, '迦莎': 477, '切赫': 465 };
let 好 = 0, 差 = 0;
for (const [n, a] of Object.entries(锚)) {
  const r = 表.find(x => x.名 === n);
  if (!r) continue;
  const d = r.登场 - a;
  const f = Math.abs(d) <= 3 ? '✓' : (Math.abs(d) <= 15 ? '~' : '✗');
  if (f === '✓') 好++; else 差++;
  console.log(`   ${f} ${n.padEnd(14)} 算=${String(r.登场).padStart(4)} 锚=${String(a).padStart(4)} 差=${String(d).padStart(5)}  「${r.命中名}」`);
}
console.log(`\n精确 ${好} / ${好 + 差}`);
fs.writeFileSync(`${PROJ}/tools/line-to-idx.json`, JSON.stringify(pairs), 'utf8');
