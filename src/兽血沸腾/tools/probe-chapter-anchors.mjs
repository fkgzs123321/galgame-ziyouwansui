import fs from 'fs';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const NAMES = ['谭雅', '珊瑚美人', '阿仙奴', '安瑞达', '许德拉', '歌莉妮', '唐蓓尔金娜', '贞德', '白素青', '梦露', '嘉宝', '艾莉婕'];

// 1) 故事大纲 characters 段
const outline = YAML.parse(fs.readFileSync(`${PROJ}/故事大纲.yaml`, 'utf8'));
console.log('大纲顶层键:', Object.keys(outline).join(', '));

const chars = outline.characters || [];
console.log(`characters 条数: ${chars.length}`);
for (const n of NAMES) {
  const c = chars.find(x => String(x.name || '').includes(n));
  if (!c) { console.log(`  ${n.padEnd(8)} —— 大纲里没有`); continue; }
  const keys = Object.keys(c);
  const ch = c.chapters || c.appearances || c.章节 || c.首次登场;
  console.log(`  ${n.padEnd(8)} keys=[${keys.join(',')}] ${ch ? '章节=' + JSON.stringify(ch).slice(0, 120) : ''}`);
}

// 2) 直接数 txt 中的首次出现行号，再换算 dedup idx
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n');
// 章标题行号
const headIdx = [];
raw.forEach((l, i) => { if (/^第[^\n]{1,12}章[\s　]/.test(l.trim()) || /^第[0-9A-Za-z一二三四五六七八九十百千]+章/.test(l.trim())) headIdx.push(i); });
console.log(`\n章标题行数: ${headIdx.length}`);

console.log('\n════ 各角色首次出现（txt 行号 / 第几章 / dedup idx 估算）════');
for (const n of NAMES) {
  let first = -1, count = 0;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i].includes(n)) { count++; if (first < 0) first = i + 1; }
  }
  // 找到 first 落在第几个章标题区间
  let ci = -1;
  for (let k = 0; k < headIdx.length; k++) if (headIdx[k] + 1 <= first) ci = k; else break;
  console.log(`  ${n.padEnd(8)} 首次 txt 行 ${String(first).padStart(7)} | 第 ${ci + 1} 章 | 命中 ${count}`);
}
