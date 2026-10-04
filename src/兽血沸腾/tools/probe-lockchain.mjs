import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');
for (const w of ['生命锁链', '灵魂锁链', '心灵锁链']) {
  const idxs = [];
  for (let i = 0; i < lines.length; i++) if (lines[i].includes(w)) idxs.push(i + 1);
  console.log(`${w}: ${idxs.length} 行, 首现 L${idxs[0]}, 末现 L${idxs[idxs.length - 1]}`);
}
// 茉儿 潮汛媚惑之歌 归属
console.log('\n══ 潮汛媚惑之歌 归属检查 ══');
for (const w of ['潮汛媚惑', '人鱼']) {
  let c = 0;
  for (let i = 0; i < lines.length && c < 2; i++) {
    if (!lines[i].includes('潮汛媚惑')) continue;
    const j = lines[i].indexOf('潮汛媚惑');
    console.log(`  L${i + 1}: …${lines[i].slice(Math.max(0, j - 130), j + 110).trim()}…`);
    c++;
  }
}
