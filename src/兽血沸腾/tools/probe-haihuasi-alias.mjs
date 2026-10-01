// 查「海华丝」的别名形式，修 `也写作丽塔.海华丝` 的空转。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数 = s => 原.split(s).length - 1;

for (const w of ['丽塔.海华丝', '丽塔·海华丝', '丽塔，海华丝', '丽塔 海华丝', '丽塔', '海华丝', '拉蔻尔.薇芝', '拉蔻尔']) {
  console.log(`   ${w.padEnd(16)} ${数(w)}`);
}

console.log('\n── 含「丽塔」的全部行的写法 ──');
const 形 = new Map();
行.forEach(l => {
  if (!l.includes('丽塔')) return;
  for (const m of l.matchAll(/丽塔[.·，,\s]?[\u4e00-\u9fa5]{0,4}/g)) {
    const s = m[0];
    形.set(s, (形.get(s) ?? 0) + 1);
  }
});
for (const [s, c] of [...形].sort((a, b) => b[1] - a[1])) console.log(`   ${String(c).padStart(3)}  「${s}」`);
