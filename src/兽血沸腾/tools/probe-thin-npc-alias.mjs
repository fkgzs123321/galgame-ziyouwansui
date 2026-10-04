// 那 9 位「素材只有 1-4 行」的女性 NPC，是否还有别的称呼在原文中出现？
// 用 NPC 文件里的 /身份/ 关键词 + 通用头衔做别名检索，看看真实体量。
import fs from 'fs';
import path from 'path';

const NPC = 'src/兽血沸腾/世界书/NPC';
const LINES = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const field = (t, k) => { const m = t.match(new RegExp('^[ \\t]*' + k + '[:：][ \\t]*(.+)$', 'm')); return m ? m[1].trim() : ''; };

const THIN = ['米娅', '勃郎宁', '冰肌仙子', '凌波仙子', '含香仙子', '罗浮仙子', '希丁克', '依莎贝拉', '巢农主母'];

for (const n of THIN) {
  const p = path.join(NPC, n + '.yaml');
  const t = fs.readFileSync(p, 'utf8');
  const id = field(t, '身份');
  // 从身份里抽可检索的别名片段
  const cand = new Set();
  for (const m of id.matchAll(/([\u4e00-\u9fa5]{2,8})(?:一族|部落|城|团|会|长老|团长|副团长|大师|主母|城主|骑士|战士|仙子|女王|夫人|族长|酋长)/g)) cand.add(m[1]);
  // 通用：把身份按「，」「、」切开取末段核心词
  for (const seg of id.split(/[，,、]/)) { const s = seg.trim(); if (s.length >= 2 && s.length <= 10) cand.add(s); }

  const hits = new Map();
  for (const c of cand) {
    if (c.length < 2) continue;
    let c1 = 0, sex = 0;
    const SEX = /奶子|乳房|乳|胸|臀|屁股|腿|腰|肏|插|射|淫|骚|情欲|高潮|敏感|名器|初夜|破处|怀孕|受孕|体香|分泌|爱液|蜜汁|女/;
    for (const l of LINES) if (l.includes(c)) { c1++; if (SEX.test(l)) sex++; }
    if (c1 > 0) hits.set(c, { c1, sex });
  }
  const tot = [...hits.values()].reduce((a, b) => a + b.c1, 0);
  console.log(`\n══ ${n} ══`);
  console.log(`  身份: ${id}`);
  console.log(`  别名候选 ${hits.size} 个，合计出现 ${tot} 次`);
  [...hits.entries()].sort((a, b) => b[1].c1 - a[1].c1).slice(0, 6).forEach(([k, v]) => console.log(`     ${k.padEnd(12)} ${String(v.c1).padStart(4)} 次（含性/女词 ${v.sex}）`));
}
