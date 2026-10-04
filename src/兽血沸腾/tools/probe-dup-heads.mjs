// 只读：找出所有重复出现的章标题（非相邻也要抓），以确定真正的去重规则。
import fs from 'fs';
const PROJ = 'src/兽血沸腾';
const raw = fs.readFileSync(`${PROJ}/兽血沸腾.txt`, 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const 净 = s => String(s).replace(/^第[0-9A-Za-z一二三四五六七八九十百千零〇两]+章[\s　]*/, '')
  .replace(/[{[（(【]/g, '').replace(/[}\]）)】]/g, '').replace(/[\s　]/g, '').trim();
const isHead = t => {
  const m = t.match(/^第[0-9A-Za-z一二三四五六七八九十百千零〇两]{1,10}章/);
  if (!m) return false;
  const rest = t.slice(m[0].length);
  if (rest.length > 44) return false;
  if (/[。！？；，、]$/.test(rest) && rest.length > 20) return false;
  return true;
};
const heads = [];
raw.forEach((l, i) => { const t = l.trim(); if (isHead(t)) heads.push({ line: i + 1, 原始: t, k: 净(t) }); });
console.log(`标题行 ${heads.length}`);

const 图 = new Map();
for (const h of heads) { if (!图.has(h.k)) 图.set(h.k, []); 图.get(h.k).push(h); }
const 重复 = [...图.entries()].filter(([, v]) => v.length > 1);
console.log(`出现 >1 次的净标题 ${重复.length} 组，多出的行数 ${重复.reduce((a, [, v]) => a + v.length - 1, 0)}`);
for (const [k, v] of 重复) {
  console.log(`\n「${k}」 ×${v.length}`);
  for (const h of v) console.log(`    L${h.line}  ${h.原始}`);
}

// 相邻重复
let adj = 0;
for (let i = 1; i < heads.length; i++) if (heads[i].k === heads[i - 1].k) adj++;
console.log(`\n相邻重复 ${adj}`);
