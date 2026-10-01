// 诊断：贪心章节匹配在哪里失步。
import fs from 'fs';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n');
const outline = YAML.parse(fs.readFileSync(`${PROJ}/故事大纲.yaml`, 'utf8'));

const isHead = t => /^第[0-9A-Za-z一二三四五六七八九十百千]+章[\s　]/.test(t) || /^第[0-9A-Za-z一二三四五六七八九十百千]+章$/.test(t);
const rawHeads = [];
raw.forEach((l, i) => { const t = l.trim(); if (isHead(t)) rawHeads.push({ line: i + 1, name: t }); });
const dedupNames = outline.chapters.map(c => String(c.name || '').trim());
console.log(`rawHeads=${rawHeads.length}  dedupNames=${dedupNames.length}`);

let j = 0, fails = 0;
for (const h of rawHeads) {
  const ok = j < dedupNames.length && (h.name === dedupNames[j] || dedupNames[j].includes(h.name) || h.name.includes(dedupNames[j]));
  if (ok) j++;
  else {
    fails++;
    if (fails <= 30) {
      console.log(`FAIL#${fails}  raw[${h.line}]「${h.name}」  vs  dedup[${j}]「${dedupNames[j]}」`);
    }
  }
}
console.log(`\n最终 j=${j}  失配 ${fails} 次`);
