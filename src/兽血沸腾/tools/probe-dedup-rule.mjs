// 只读：检验若干去重规则，找出能得到权威 764 章且与时间线锚点自洽的那一条。
import fs from 'fs';
const PROJ = 'src/兽血沸腾';
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const 净 = s => String(s).replace(/^第[0-9A-Za-z一二三四五六七八九十百千零〇两]+章[\s　]*/, '')
  .replace(/[{[（(【]/g, '').replace(/[}\]）)】]/g, '').replace(/[\s　]/g, '').trim();
const 号 = s => (String(s).match(/^第([0-9A-Za-z一二三四五六七八九十百千零〇两]+)章/) || [])[1];
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
console.log(`标题行 ${heads.length}\n`);

// 规则 A：相邻同净名才折叠
// 规则 B：同净名 且 同印刷号 折叠
// 规则 C：同净名 且 同印刷号 且 行距 < 8000 折叠
for (const [名, fn] of [
  ['A 相邻同净名', (h, seen) => seen.length && seen[seen.length - 1].k === h.k],
  ['B 同净名+同号', (h, seen) => seen.some(s => s.k === h.k && s.号 === h.号)],
  ['C 同净名+同号+行距<8000', (h, seen) => seen.some(s => s.k === h.k && s.号 === h.号 && h.line - s.line < 8000)],
]) {
  const out = []; const seenSeen = [];
  for (const h of heads) {
    if (fn(h, seenSeen)) continue;
    out.push(h); seenSeen.push(h);
  }
  const anchors = {};
  for (const nm of ['翡冷翠领主', '以自由的名义', '挥刀问情', '天鹅族女骑士', '剑桥大祭师']) {
    const i = out.findIndex(o => o.k.includes(nm));
    anchors[nm] = i;
  }
  console.log(`${名}: 去重后 ${out.length} 章`);
  console.log(`   锚点 ${JSON.stringify(anchors)}`);
}
