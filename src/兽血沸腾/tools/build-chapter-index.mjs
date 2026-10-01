// 权威章节索引：idx = 故事大纲.yaml 的 chapters 数组下标（0..763）。
// 这就是「剧情.章节序号」的定义（check-ejs.mjs 的 CHAPS 亦止于 763）。
// 为每个 idx 单调定位原文标题行。注意原文是 CRLF，须先剥 \r。
// 输出 tools/chapter-index.json：[{idx, name, 净, line, 原始, 折叠}]
import fs from 'fs';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const outline = YAML.parse(fs.readFileSync(`${PROJ}/故事大纲.yaml`, 'utf8'));

// 净名保留括号内的 上/中/下/A/B/【1】 标记（只统一括号形式），
// 以便与 chapters[] 的合并章名做前缀匹配。
const 净 = s => String(s).replace(/^第[0-9A-Za-z一二三四五六七八九十百千零〇两]+章[\s　]*/, '')
  .replace(/[{[（(【]/g, '').replace(/[}\]）)】]/g, '')
  .replace(/[\s　]/g, '').trim();
const 号 = s => (String(s).match(/^第([0-9A-Za-z一二三四五六七八九十百千零〇两]+)章/) || [])[1] || '';
const isHead = t => {
  const m = t.match(/^第[0-9A-Za-z一二三四五六七八九十百千零〇两]{1,10}章/);
  if (!m) return false;
  const rest = t.slice(m[0].length);
  if (rest.length > 44) return false;
  if (/[。！？；，、]$/.test(rest) && rest.length > 20) return false;
  return true;
};

const heads = [];
raw.forEach((l, i) => { const t = l.trim(); if (isHead(t)) heads.push({ line: i + 1, 原始: t, k: 净(t), 号: 号(t) }); });
const chaps = outline.chapters.map((c, i) => ({ idx: i, name: String(c.name || '').trim(), 净: 净(c.name) }));
console.log(`原文标题行 ${heads.length}；outline.chapters ${chaps.length}（权威 idx 0..${chaps.length - 1}）`);

// 单调匹配：合并章（如「渡口恩仇」）会吃掉后续的 中/下 行。
let hi = 0;
const out = [];
for (const c of chaps) {
  let pick = -1;
  for (let i = hi; i < heads.length; i++) {
    // 命中条件：净名完全相等，或原文净名以合并章净名为前缀（上/中/下 等分卷标记已被剥掉时）
    if (heads[i].k === c.净 || heads[i].k.startsWith(c.净) || c.净.startsWith(heads[i].k)) { pick = i; break; }
  }
  if (pick < 0) { out.push({ ...c, line: null, 原始: null, 折叠: 0 }); continue; }
  // 吃掉紧随其后的同名前缀分卷行
  let j = pick + 1;
  while (j < heads.length && (heads[j].k.startsWith(c.净) || c.净.startsWith(heads[j].k)) && heads[j].号 && heads[pick].号
         && Number(heads[j].号) <= Number(heads[pick].号) + 6) j++;
  out.push({ ...c, line: heads[pick].line, 原始: heads[pick].原始, 折叠: j - pick - 1 });
  hi = j;
}

const 定位 = out.filter(x => x.line).length;
console.log(`已定位 ${定位} / ${chaps.length}`);
for (const x of out.filter(v => !v.line)) console.log(`   ✗ idx${x.idx} 《${x.name}》 未定位`);
let 单调 = 0;
for (let i = 1; i < out.length; i++) if (out[i].line && out[i - 1].line && out[i].line <= out[i - 1].line) 单调++;
console.log(`行号非单调 ${单调}`);

console.log('\n锚点核对:');
for (const nm of ['勇斗魔狼', '以自由的名义', '翡冷翠领主', '天鹅族女骑士', '挥刀问情', '剑桥大祭师', '大结局']) {
  const h = out.filter(x => x.净.includes(nm));
  console.log(`  《${nm}》 → ${h.map(v => `idx${v.idx}(印刷第${号(v.原始 || v.name)}章)@L${v.line}`).join(' , ') || '未找到'}`);
}
const last = out[out.length - 1];
console.log(`\n末章 idx${last.idx} 《${last.name}》 L${last.line} 折叠${last.折叠}`);

fs.writeFileSync(`${PROJ}/tools/chapter-index.json`, JSON.stringify(out.map(({ 净: _n, ...r }) => r), null, 1), 'utf8');
console.log('→ 已写 tools/chapter-index.json');
