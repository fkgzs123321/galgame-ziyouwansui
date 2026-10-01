import fs from 'fs';

const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
console.log('潘帅/潘塔/潘塔族/古德 辨析：');
for (const k of ['潘帅', '潘塔族', '熊猫战士', '潘塔熊猫']) console.log(`  ${k}: ${t.split(k).length - 1}`);
console.log('\n潘帅 首次出现：');
const i = t.indexOf('潘帅');
console.log('  …' + t.slice(Math.max(0, i - 200), i + 120).replace(/\n/g, ' ') + '…');

// 琴心战歌 在产物中的位置
console.log('\n══ 产物中 琴心战歌 ══');
import path from 'path';
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/tools|node_modules|dist/.test(e.name)) walk(p); }
    else if (/\.(ya?ml|md)$/.test(e.name)) {
      fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        if (l.includes('琴心战歌')) console.log(`  ${path.relative('src/兽血沸腾', p)}:${i + 1}  ${l.trim().slice(0, 160)}`);
      });
    }
  }
})('src/兽血沸腾');
