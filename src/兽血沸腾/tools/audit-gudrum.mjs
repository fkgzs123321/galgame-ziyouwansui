import fs from 'fs';
const all = [];
const walk = (d, base) => {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = `${d}/${f.name}`;
    if (f.isDirectory()) walk(p, base); else if (/\.ya?ml$|\.vue$/.test(f.name)) all.push([p.replace(base + '/', ''), fs.readFileSync(p, 'utf8')]);
  }
};
walk('src/兽血沸腾/世界书', 'src/兽血沸腾/世界书');
walk('src/兽血沸腾/界面', 'src/兽血沸腾/界面');
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
console.log('词'.padEnd(16) + '成品  原文');
for (const w of ['夔鼓', '姜之忍耐夔鼓', '姜之忍耐夔歌', '迟钝之歌', '盐霜肤甲', '盐甲', '洛丹伦守护者之歌', '魔法闪耀', '超级燃灵之链', '邪眼暴君']) {
  const tot = all.reduce((s, [, c]) => s + (c.split(w).length - 1), 0);
  console.log('  ' + w.padEnd(18) + String(tot).padStart(4) + String(t.split(w).length - 1).padStart(6) + (tot === 0 ? '  <<< 成品缺失' : ''));
}
