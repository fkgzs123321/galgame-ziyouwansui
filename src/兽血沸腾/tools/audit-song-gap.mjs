import fs from 'fs';
const all = [];
const walk = (d, base) => {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = `${d}/${f.name}`;
    if (f.isDirectory()) walk(p, base); else if (/\.ya?ml$/.test(f.name)) all.push([p.replace(base + '/', ''), fs.readFileSync(p, 'utf8')]);
  }
};
walk('src/兽血沸腾/世界书', 'src/兽血沸腾/世界书');
const blob = all.map(x => x[1]).join('\n');
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');

for (const w of ['翡冷翠之歌', '荆棘护甲之歌', '翡冷翠荆棘护甲之歌', '生命锁链战歌', '生命锁链', '潮汛媚惑之歌', '自然进化']) {
  const inProduct = blob.split(w).length - 1;
  console.log(`  ${w.padEnd(14)} 成品 ${String(inProduct).padStart(4)}   原文 ${String(t.split(w).length - 1).padStart(4)}   ${inProduct === 0 ? '<<< 成品缺失' : ''}`);
}
console.log('\n══ 哪些文件提到「自然进化」══');
for (const [p, c] of all) if (c.includes('自然进化')) console.log(`  ${p} (${c.split('自然进化').length - 1})`);
