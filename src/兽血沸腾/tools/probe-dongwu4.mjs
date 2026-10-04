import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const show = (a, b, tag) => {
  console.log(`\n══ ${tag} ══`);
  for (let i = a; i <= b; i++) { const t = lines[i - 1].trim(); if (t) console.log(`L${i}: ${t.slice(0, 190)}`); }
};
// 小净 首次登场（群像说是唐藏亲王的学徒）
show(10918, 10926, '小净 idx L10922');
show(93636, 93646, '小净 L93640');
show(99406, 99414, '小净 L99410 / 四殿下');
// 四殿下 身份
for (const kw of ['四殿下', '玄奥的壮汉', '冬空', '唐藏帝国']) {
  const h = [];
  lines.forEach((l, i) => { if (l.includes(kw)) h.push(i + 1); });
  console.log(`\n【${kw}】${h.length} 行 → ${h.slice(0, 10).join(', ')}`);
}
// 唐藏亲王 = 五殿下? 检查
for (const kw of ['唐藏亲王', '五殿下']) {
  const h = [];
  lines.forEach((l, i) => { if (l.includes(kw)) h.push(i + 1); });
  console.log(`\n【${kw}】与【四殿下】同现行: ` + h.filter(i => lines[i - 1].includes('四殿下')).join(', '));
}
