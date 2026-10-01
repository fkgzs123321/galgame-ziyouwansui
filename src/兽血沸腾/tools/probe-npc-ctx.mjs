import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = txt.split('\n');

function hits(name) {
  const out = [];
  lines.forEach((l, i) => { if (l.includes(name)) out.push(i + 1); });
  return out;
}
const probe = ['依莎贝拉', '伊莎贝拉', '巴克蒂亚萨德赫', '米娅', '死神印记', '口水怪', '凌波仙子', '冰肌仙子', '罗浮仙子', '含香仙子', '赫莲娜', '希丁克', '紫色霞云', '海德'];
for (const n of probe) {
  const h = hits(n);
  console.log(`\n══ ${n} — ${h.length} 行 ══`);
  h.slice(0, 3).forEach(i => console.log(`  L${i}: ${lines[i - 1].trim().slice(0, 150)}`));
}
