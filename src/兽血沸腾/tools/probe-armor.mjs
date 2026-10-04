import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');
for (const w of ['盐霜护甲', '海绵护甲']) {
  console.log(`\n══ ${w} (${t.split(w).length - 1}) ══`);
  let c = 0;
  for (let i = 0; i < lines.length && c < 4; i++) {
    if (!lines[i].includes(w)) continue;
    const j = lines[i].indexOf(w);
    console.log(`  L${i + 1}: …${lines[i].slice(Math.max(0, j - 130), j + 170).trim()}…`);
    c++;
  }
}
