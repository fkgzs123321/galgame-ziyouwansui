// 诊断7：几个错位名的首现行，看是误命中还是真登场。
import fs from 'fs';

const raw = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const pairs = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/line-to-idx.json', 'utf8'));
const idxForLine = ln => { let cur = -1; for (const p of pairs) { if (p.line <= ln) cur = p.idx; else break; } return cur; };

for (const n of ['贞德', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '艾莉婕', '崔蓓茜', '妮可', '幽月儿', '海伦.列娜', '凝玉']) {
  const hits = [];
  for (let i = 0; i < raw.length && hits.length < 4; i++) if (raw[i].includes(n)) hits.push({ ln: i + 1, t: raw[i].trim().slice(0, 90) });
  console.log(`\n── ${n} ──`);
  for (const h of hits) console.log(`   L${h.ln} idx=${idxForLine(h.ln)}  ${h.t}`);
}
