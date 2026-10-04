// 诊断5：outline 里 第六百四十×章 附近叫什么，以及 dedup[722] 前后。
import fs from 'fs';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const outline = YAML.parse(fs.readFileSync(`${PROJ}/故事大纲.yaml`, 'utf8'));
const dedup = outline.chapters.map((c, i) => ({ i, name: String(c.name || '').trim() }));

console.log('══ dedup[715..745] ══');
for (let i = 715; i <= 745 && i < dedup.length; i++) console.log(`  ${i}: ${dedup[i].name}`);

console.log('\n══ outline 里所有含「六百四十」或「六百五十」或「六百六十」的 ══');
for (const d of dedup) if (/第六百[四五六]十/.test(d.name)) console.log(`  ${d.i}: ${d.name}`);

console.log('\n══ raw 的 第六百四十× / 六百五十× ══');
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n');
raw.forEach((l, i) => {
  const t = l.trim();
  if (/^第六百[四五六]十[一二三四五六七八九]?章/.test(t)) console.log(`  L${i + 1}: ${t}`);
});
