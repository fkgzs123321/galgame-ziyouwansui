// 诊断3：按「章号」匹配 raw ←→ outline，并列出 outline 里的重号。
import fs from 'fs';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n');
const outline = YAML.parse(fs.readFileSync(`${PROJ}/故事大纲.yaml`, 'utf8'));

const CN = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
const 数字 = s => {
  if (/^\d+$/.test(s)) return +s;
  let total = 0, cur = 0;
  for (const ch of s) {
    if (ch === '百') { cur = (cur || 1) * 100; total += cur; cur = 0; }
    else if (ch === '千') { cur = (cur || 1) * 1000; total += cur; cur = 0; }
    else if (ch === '十') { cur = (cur || 1) * 10; total += cur; cur = 0; }
    else if (CN[ch] !== undefined) cur = CN[ch];
  }
  return total + cur;
};
const 章号 = s => { const m = String(s).match(/^第([0-9A-Za-z一二三四五六七八九十百千零〇两]+)章/); return m ? 数字(m[1]) : -1; };

const isHead = t => /^第[0-9A-Za-z一二三四五六七八九十百千]+章[\s　]/.test(t) || /^第[0-9A-Za-z一二三四五六七八九十百千]+章$/.test(t);
const rawHeads = [];
raw.forEach((l, i) => { const t = l.trim(); if (isHead(t)) rawHeads.push({ line: i + 1, name: t, n: 章号(t) }); });

const ol = outline.chapters.map((c, i) => ({ i, name: String(c.name || '').trim(), n: 章号(String(c.name || '')) }));

console.log(`rawHeads=${rawHeads.length}  outline=${ol.length}`);
console.log('raw 章号 前5: ' + rawHeads.slice(0, 5).map(x => x.n).join(','));
console.log('raw 章号 后5: ' + rawHeads.slice(-5).map(x => x.n).join(','));
console.log('outline 章号 前5: ' + ol.slice(0, 5).map(x => x.n).join(','));
console.log('outline 章号 后5: ' + ol.slice(-5).map(x => x.n).join(','));

// outline 重号
const cnt = {};
for (const o of ol) cnt[o.n] = (cnt[o.n] || 0) + 1;
const dup = Object.entries(cnt).filter(([, c]) => c > 1).map(([n, c]) => `${n}×${c}`);
console.log(`\noutline 重号: ${dup.length ? dup.join(' ') : '无'}`);

// 单调性
let 逆 = 0;
for (let i = 1; i < ol.length; i++) if (ol[i].n < ol[i - 1].n) 逆++;
console.log(`outline 章号非单调处: ${逆}`);

// 只存在于 outline 的章号（raw 缺）
const rawN = new Set(rawHeads.map(x => x.n));
const 缺 = ol.filter(o => !rawN.has(o.n));
console.log(`\noutline 有而 raw 无的章号: ${缺.length} 个`);
console.log('  ' + 缺.map(o => `${o.i}(${o.n})`).join(' '));

const olN = new Set(ol.map(o => o.n));
const 多 = rawHeads.filter(x => !olN.has(x.n));
console.log(`\nraw 有而 outline 无的章号: ${多.length} 个`);
console.log('  ' + 多.slice(0, 30).map(x => `${x.line}(${x.n})「${x.name}」`).join(' '));
