import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const has = (i, ...ks) => ks.every(k => lines[i].includes(k));

console.log('══ 唐藏亲王 与 四殿下/五殿下 同现行 ══');
for (const p of [['唐藏亲王', '四殿下'], ['唐藏亲王', '五殿下'], ['唐藏亲王', '冬五'], ['唐藏亲王', '大力士'], ['唐藏亲王', '僧侣']]) {
  const h = [];
  lines.forEach((l, i) => { if (has(i, ...p)) h.push(i + 1); });
  console.log(`  ${p.join(' + ')}: ${h.length} 行 → ${h.slice(0, 8).join(', ')}`);
}

// 大段落上下文
const show = (a, b, tag) => {
  console.log(`\n══ ${tag} ══`);
  for (let i = a; i <= b; i++) { const t = lines[i - 1].trim(); if (t) console.log(`L${i}: ${t.slice(0, 185)}`); }
};
show(92762, 92780, '冬空/冬五 首次');
show(97946, 97970, '唇红齿白英俊亲王 段落');
show(99250, 99260, '四殿下+五殿下 同现');
show(101184, 101192, '四殿下+五殿下 同现2');
