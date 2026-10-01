import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');
console.log('══ 魔法闪耀 全部上下文 ══');
for (let i = 0; i < lines.length; i++) {
  if (!lines[i].includes('魔法闪耀')) continue;
  const j = lines[i].indexOf('魔法闪耀');
  console.log(`  L${i + 1}: …${lines[i].slice(Math.max(0, j - 120), j + 180).trim()}…\n`);
}
console.log('══ 成品中「魔法闪耀」出现在哪 ══');
const walk = (d) => {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = `${d}/${f.name}`;
    if (f.isDirectory()) walk(p);
    else if (/\.ya?ml$/.test(f.name)) {
      const c = fs.readFileSync(p, 'utf8');
      if (c.includes('魔法闪耀')) console.log(`  ${p}`);
    }
  }
};
walk('src/兽血沸腾/世界书');
