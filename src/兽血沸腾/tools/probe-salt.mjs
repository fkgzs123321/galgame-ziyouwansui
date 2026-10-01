import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
for (const w of ['盐霜护甲', '荆棘护甲之歌', '海绵护甲', '神圣荆棘护甲', '魔法闪耀', '盐霜']) {
  console.log(`  ${w.padEnd(14)} ${t.split(w).length - 1}`);
}
