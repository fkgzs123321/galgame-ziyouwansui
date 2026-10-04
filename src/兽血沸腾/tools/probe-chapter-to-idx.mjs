import fs from 'fs';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const NAMES = ['谭雅', '珊瑚美人', '阿仙奴', '安瑞达', '许德拉', '歌莉妮', '唐蓓尔金娜', '贞德', '白素青', '梦露', '嘉宝', '艾莉婕', '凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝'];

const outline = YAML.parse(fs.readFileSync(`${PROJ}/故事大纲.yaml`, 'utf8'));
console.log('大纲 chapters 第 1 条 keys:', Object.keys(outline.chapters[0]).join(', '));
console.log('样例:', JSON.stringify(outline.chapters[0]).slice(0, 300));

const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n');
const isHead = t => /^第[0-9A-Za-z一二三四五六七八九十百千]+章[\s　]/.test(t) || /^第[0-9A-Za-z一二三四五六七八九十百千]+章$/.test(t);
const rawHeads = [];
raw.forEach((l, i) => { const t = l.trim(); if (isHead(t)) rawHeads.push({ line: i + 1, name: t }); });
console.log(`\nraw 章标题 ${rawHeads.length}，大纲 chapters ${outline.chapters.length}`);

// 贪心顺序匹配：rawHeads 与 outline.chapters 名字对齐，未匹配的 raw 行视为重复章
const dedupNames = outline.chapters.map(c => String(c.name || c.title || c.标题 || '').trim());
let j = 0; const lineToIdx = [];
for (const h of rawHeads) {
  if (j < dedupNames.length && (h.name === dedupNames[j] || dedupNames[j].includes(h.name) || h.name.includes(dedupNames[j]))) {
    lineToIdx.push({ line: h.line, idx: j, name: h.name, dup: false }); j++;
  } else {
    lineToIdx.push({ line: h.line, idx: j - 1, name: h.name, dup: true });
  }
}
console.log(`匹配到 ${j} / ${dedupNames.length} 个去重章；被判为重复的 raw 标题 ${lineToIdx.filter(x => x.dup).length} 个`);

const idxForLine = ln => {
  let cur = -1;
  for (const e of lineToIdx) { if (e.line <= ln) cur = e.idx; else break; }
  return cur;
};

console.log('\n════ 各角色首次出现 → dedup 章节序号 ════');
for (const n of NAMES) {
  let first = -1;
  for (let i = 0; i < raw.length; i++) if (raw[i].includes(n)) { first = i + 1; break; }
  const idx = idxForLine(first);
  const h = lineToIdx.filter(e => e.line <= first).pop();
  console.log(`  ${n.padEnd(8)} txt ${String(first).padStart(7)} → 章节序号 ${String(idx).padStart(3)}  (${h ? h.name : '?'})`);
}
