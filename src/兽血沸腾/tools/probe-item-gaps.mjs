import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');
const probe = ['翡冷翠之歌', '生命锁链战歌', '兽浪领域结界', '风之符文锁链', '兽浪结界', '磁力悬浮术', '大雷音领域', '南斗六星祝福', '北斗七星诅咒', '巴比伦魔法巨炮', '潮汛媚惑之歌'];
for (const w of probe) {
  const n = t.split(w).length - 1;
  console.log(`\n══ ${w} (${n}) ══`);
  let c = 0;
  for (let i = 0; i < lines.length && c < 3; i++) {
    if (!lines[i].includes(w)) continue;
    const j = lines[i].indexOf(w);
    console.log(`  L${i + 1}: …${lines[i].slice(Math.max(0, j - 90), j + 150).trim()}…`);
    c++;
  }
}
