// 探针：海伦 与 青雅 是否真的唯一指向。
import fs from 'fs';

const 行 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const 含 = s => 行.filter(l => l.includes(s));

console.log('══ 海伦：是否另有其人 ══');
const 海 = 含('海伦');
// 除「海伦.列娜」外，看「海伦」后紧接的字，判断有没有别的「海伦X」
const 后 = new Map();
for (const l of 海) {
  let i = l.indexOf('海伦');
  while (i !== -1) {
    const t = l.slice(i + 2, i + 4);
    if (t && !/^[.·]/.test(t)) 后.set(t, (后.get(t) || 0) + 1);
    i = l.indexOf('海伦', i + 1);
  }
}
console.log('   「海伦」后两字 top12（排除 .列娜）：');
[...后].sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([t, n]) => console.log(`      「海伦${t}」 ×${n}`));
console.log(`   含「海伦.列娜」或「海伦·列娜」：${含('海伦.列娜').length + 含('海伦·列娜').length} 行`);

console.log('\n══ 青雅：是否另有其人 ══');
const 青 = 含('青雅');
console.log(`   「青雅」总 ${青.length} 行`);
const 青后 = new Map();
for (const l of 青) {
  let i = l.indexOf('青雅');
  while (i !== -1) {
    const t = l.slice(i + 2, i + 5);
    青后.set(t, (青后.get(t) || 0) + 1);
    i = l.indexOf('青雅', i + 1);
  }
}
[...青后].sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([t, n]) => console.log(`      「青雅${t}」 ×${n}`));
console.log('   「青雅」不含「白玉」的样本 5 行：');
青.filter(l => !l.includes('白玉')).slice(0, 5).forEach(l => console.log(`      ${l.trim().slice(0, 100)}`));

console.log('\n══ 米娅 是否另有其人 ══');
含('米娅').forEach(l => console.log(`      ${l.trim().slice(0, 110)}`));
