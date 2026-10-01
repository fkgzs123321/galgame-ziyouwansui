// 临时探针：打印指定 NPC 条目中各锚点的首现行/章，以及 NPC 名首现章。用完即删。
import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const heads = [];
lines.forEach((l, i) => { if (/^第[一二三四五六七八九十百零〇\d]+章\s/.test(l.trim())) heads.push(i); });
const chapOf = ln => { let c = 0; for (const h of heads) { if (h <= ln) c++; else break; } return c - 1; };
const firstOf = s => lines.findIndex(l => l.includes(s));

const ANCH = ['被遗忘国度', '遗忘历', '介丘', '花王', '花相', '花廷', '巫妖王', '恐惧魔王', '教宗',
  '圣奇奥', '采玉城', '海加尔', '龙禁卫', '摄政', '加冕', '太保团', '航空兵', '海神岛', '佛巨人',
  '灰矮人', '山丘之王', '花精灵', '战死', '阵亡', '称帝', '皇后', '登基', '巫妖女王', '星界', '梦界',
  '魔界', '龙城', '摩韶', '卢塞恩', '翡冷翠', '神曲萨满', '大结局'];

const files = process.argv.slice(2);
for (const n of files) {
  const t = fs.readFileSync(path.join(NPC, n + '.yaml'), 'utf8');
  const seg = t.split(/\n(?=语言特征:)/)[0];
  const nm = (t.match(/^  姓名: (.*)$/m) || [, n])[1];
  const cands = [...new Set([n, ...nm.split(/又称/).map(s => s.trim().split(/[，,]/)[0])])].filter(x => x.length >= 2);
  let fLn = -1, which = '';
  for (const c of cands) { const i = firstOf(c); if (i >= 0 && (fLn < 0 || i < fLn)) { fLn = i; which = c; } }
  console.log(`\n=== ${n} | 名首现 ${which} L${fLn + 1} ch${chapOf(fLn)}`);
  for (const k of ANCH) { if (!seg.includes(k)) continue; const i = firstOf(k); console.log(`    ${k.padEnd(6)} L${i + 1} ch${chapOf(i)} ${chapOf(i) > chapOf(fLn) ? '  <<< 泄漏' : ''}`); }
}
