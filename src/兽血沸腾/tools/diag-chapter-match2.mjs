// 诊断2：只用「标题正文」（去掉章号前缀）匹配，看是否对齐。
import fs from 'fs';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n');
const outline = YAML.parse(fs.readFileSync(`${PROJ}/故事大纲.yaml`, 'utf8'));

const 去号 = s => s.replace(/^第[0-9A-Za-z一二三四五六七八九十百千零〇]+章[\s　]*/, '').replace(/\{[^}]*\}/g, '').trim();
const isHead = t => /^第[0-9A-Za-z一二三四五六七八九十百千]+章[\s　]/.test(t) || /^第[0-9A-Za-z一二三四五六七八九十百千]+章$/.test(t);
const rawHeads = [];
raw.forEach((l, i) => { const t = l.trim(); if (isHead(t)) rawHeads.push({ line: i + 1, name: t, title: 去号(t) }); });

const dedup = outline.chapters.map((c, i) => ({ i, name: String(c.name || '').trim(), title: 去号(String(c.name || '')) }));

// 建 title → [indices]
const map = new Map();
for (const d of dedup) { if (!map.has(d.title)) map.set(d.title, []); map.get(d.title).push(d.i); }

console.log('══ 用标题正文查几个 raw 章 ══');
for (const r of [rawHeads[0], rawHeads[50], rawHeads[109], rawHeads[159], rawHeads[200], rawHeads[300], rawHeads[500], rawHeads[700]]) {
  if (!r) continue;
  const hits = map.get(r.title);
  console.log(`  raw「${r.name}」 标题「${r.title}」 → dedup ${hits ? hits.join(',') : '(无)'}`);
}

// 贪心按标题匹配
let j = 0, ok = 0, fail = 0; const failEx = [];
for (const h of rawHeads) {
  let found = -1;
  for (let k = j; k < Math.min(j + 8, dedup.length); k++) if (dedup[k].title === h.title) { found = k; break; }
  if (found >= 0) { j = found + 1; ok++; } else { fail++; if (failEx.length < 12) failEx.push(`raw[${h.line}]「${h.name}」 vs dedup[${j}]「${dedup[j]?.name}」`); }
}
console.log(`\n标题匹配：成功 ${ok} / ${rawHeads.length}，失败 ${fail}`);
failEx.forEach(x => console.log('  ✗ ' + x));

console.log(`\nrawHeads=${rawHeads.length}  outline.chapters=${dedup.length}`);
console.log('outline 前 5: ' + dedup.slice(0, 5).map(d => `${d.i}:${d.name}`).join(' | '));
console.log('outline[155..170]: ' + dedup.slice(155, 171).map(d => `${d.i}:${d.name}`).join(' | '));
