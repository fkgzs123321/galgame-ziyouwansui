// 诊断4：放宽窗口按标题匹配，验证能否全部对齐。
import fs from 'fs';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n');
const outline = YAML.parse(fs.readFileSync(`${PROJ}/故事大纲.yaml`, 'utf8'));

const 净 = s => String(s).replace(/^第[0-9A-Za-z一二三四五六七八九十百千零〇两]+章[\s　]*/, '')
  .replace(/[{[（(【][^}\]）)】]*[}\]）)】]/g, '').replace(/[\s　]/g, '').trim();
const isHead = t => /^第[0-9A-Za-z一二三四五六七八九十百千]+章[\s　]/.test(t) || /^第[0-9A-Za-z一二三四五六七八九十百千]+章$/.test(t);
const rawHeads = [];
raw.forEach((l, i) => { const t = l.trim(); if (isHead(t)) rawHeads.push({ line: i + 1, name: t, k: 净(t) }); });
const dedup = outline.chapters.map((c, i) => ({ i, name: String(c.name || '').trim(), k: 净(c.name) }));

const WIN = 120;
let j = 0, ok = 0, fail = 0; const failEx = [], pairs = [];
for (const h of rawHeads) {
  let found = -1;
  for (let k = j; k < Math.min(j + WIN, dedup.length); k++) if (dedup[k].k === h.k) { found = k; break; }
  if (found >= 0) { pairs.push({ line: h.line, idx: found }); j = found + 1; ok++; }
  else { fail++; if (failEx.length < 15) failEx.push(`raw[${h.line}]「${h.name}」 vs dedup[${j}]「${dedup[j]?.name}」`); }
}
console.log(`窗口=${WIN}  成功 ${ok} / ${rawHeads.length}  失败 ${fail}`);
failEx.forEach(x => console.log('  ✗ ' + x));

if (fail === 0) {
  const idxForLine = ln => { let cur = -1; for (const p of pairs) { if (p.line <= ln) cur = p.idx; else break; } return cur; };
  // 用已知锚点核对
  const 锚 = { '海伦.列娜': 2, '凝玉': 21, '艾薇尔': 24, '崔蓓茜': 43, '歌坦妮': 94, '若尔娜': 145,
    '黛丝': 133, '贞德': 59, '白素青': 241, '谭雅': 340, '阿仙奴': 104, '许德拉': 60, '歌莉妮': 60,
    '唐蓓尔金娜': 70, '梦露': 300, '嘉宝': 520, '艾莉婕': 200, '幽月儿': 260, '加茜娅': 176,
    '伦娜': 278, '费雯丽': 245, '朝河兰': 708, '珍妮佛': 140, '波姬小丝': 623, '赫莲娜': 210,
    '安瑞达': 464, '喀秋莎': 71, '海华丝': 588, '罗德曼': 121, '永贝里': 105, '菲高': 29,
    '阿杜': 107, '布拉特': 144, '保罗·马尔蒂尼': 185, '罗纳尔迪尼奥': 226, '埃托奥': 406,
    '明姚': 427, '席尔维斯特': 483, '阿杜': 107, '依莎贝拉': 588, '波利斯': 716, '迦莎': 477, '切赫': 465 };
  console.log('\n══ 锚点核对 ══');
  for (const [n, a] of Object.entries(锚)) {
    let first = -1;
    for (let i = 0; i < raw.length; i++) if (raw[i].includes(n)) { first = i + 1; break; }
    const idx = idxForLine(first);
    const d = idx - a;
    const flag = Math.abs(d) <= 3 ? '✓' : (Math.abs(d) <= 12 ? '~' : '✗');
    console.log(`   ${flag} ${n.padEnd(14)} 算=${String(idx).padStart(4)} 锚=${String(a).padStart(4)} 差=${String(d).padStart(5)}`);
  }
}
