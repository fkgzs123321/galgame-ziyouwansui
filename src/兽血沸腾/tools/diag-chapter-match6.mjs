// 诊断6：修正 isHead（允许章号后无空格），重做匹配并核对锚点。
import fs from 'fs';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n');
const outline = YAML.parse(fs.readFileSync(`${PROJ}/故事大纲.yaml`, 'utf8'));

const 净 = s => String(s).replace(/^第[0-9A-Za-z一二三四五六七八九十百千零〇两]+章[\s　]*/, '')
  .replace(/[{[（(【][^}\]）)】]*[}\]）)】]/g, '').replace(/[\s　]/g, '').trim();

// 放宽：章号后可有可无空格，但整行要像标题（短、不含句末标点、不以标点开头）
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
console.log(`rawHeads=${rawHeads.length}  outline=${dedup.length}`);

// title → 全部候选索引
const 图 = new Map();
dedup.forEach(d => { if (!图.has(d.k)) 图.set(d.k, []); 图.get(d.k).push(d.i); });

let j = 0, ok = 0, fail = 0; const failEx = [], pairs = [];
for (const h of rawHeads) {
  const cands = 图.get(h.k) || [];
  let pick = cands.find(c => c >= j);
  if (pick === undefined) pick = cands[cands.length - 1];
  if (pick !== undefined && pick >= j - 25) {   // 容许极小回溯
    pairs.push({ line: h.line, idx: pick }); j = pick + 1; ok++;
  } else { fail++; if (failEx.length < 20) failEx.push(`L${h.line}「${h.name}」 候选=[${cands.join(',')}] j=${j}`); }
}
console.log(`成功 ${ok} / ${rawHeads.length}  失败 ${fail}`);
failEx.forEach(x => console.log('  ✗ ' + x));

const idxForLine = ln => { let cur = -1; for (const p of pairs) { if (p.line <= ln) cur = p.idx; else break; } return cur; };
const 锚 = { '海伦.列娜': 2, '凝玉': 21, '艾薇尔': 24, '崔蓓茜': 43, '歌坦妮': 94, '若尔娜': 145,
  '黛丝': 133, '贞德': 59, '白素青': 241, '谭雅': 340, '阿仙奴': 104, '许德拉': 60, '歌莉妮': 60,
  '唐蓓尔金娜': 70, '梦露': 300, '嘉宝': 520, '艾莉婕': 200, '幽月儿': 260, '加茜娅': 176,
  '伦娜': 278, '费雯丽': 245, '朝河兰': 708, '珍妮佛': 140, '波姬小丝': 623, '赫莲娜': 210,
  '安瑞达': 464, '喀秋莎': 71, '海华丝': 588, '罗德曼': 121, '永贝里': 105, '菲高': 29,
  '阿杜': 107, '布拉特': 144, '保罗·马尔蒂尼': 185, '罗纳尔迪尼奥': 226, '埃托奥': 406,
  '明姚': 427, '席尔维斯特': 483, '依莎贝拉': 588, '波利斯': 716, '迦莎': 477, '切赫': 465 };
console.log('\n══ 锚点核对 ══');
let 好 = 0, 差 = 0;
for (const [n, a] of Object.entries(锚)) {
  let first = -1;
  for (let i = 0; i < raw.length; i++) if (raw[i].includes(n)) { first = i + 1; break; }
  const idx = idxForLine(first);
  const d = idx - a;
  const flag = Math.abs(d) <= 3 ? '✓' : (Math.abs(d) <= 15 ? '~' : '✗');
  if (flag === '✓') 好++; else 差++;
  console.log(`   ${flag} ${n.padEnd(14)} 算=${String(idx).padStart(4)} 锚=${String(a).padStart(4)} 差=${String(d).padStart(5)}`);
}
console.log(`\n精确命中 ${好} / ${好 + 差}`);
fs.writeFileSync(`${PROJ}/tools/line-to-idx.json`, JSON.stringify(pairs), 'utf8');
console.log('✓ pairs 已存 line-to-idx.json');
