// 紧急核验：茜茜/姬丝凯碧/茉儿 三个「排除档」文件的年龄与身高表述是否有原文依据。
// 若有人把未成年改成成年以放行 NSFW，就是源事实篡改。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数 = s => 原.split(s).length - 1;

console.log('══ 茜茜 年龄线索 ══');
for (const w of ['十四五岁', '二十四五岁', '成年礼', '还未到成年', '发育完全', '年纪最多']) {
  console.log(`   「${w}」 ${数(w)}`);
}
行.forEach((l, i) => { if (/茜茜/.test(l) && /岁|成年礼|发育/.test(l)) console.log(`   L${i}: ${l.trim().slice(0, 150)}`); });

console.log('\n══ 姬丝凯碧 身高/发育线索 ══');
for (const w of ['一米八', '米八', '还没发育', '未发育', '没发育', '十米']) console.log(`   「${w}」 ${数(w)}`);
行.forEach((l, i) => { if (/姬丝凯碧/.test(l) && /米|发育|岁/.test(l)) console.log(`   L${i}: ${l.trim().slice(0, 150)}`); });

console.log('\n══ 茉儿 年龄线索 ══');
行.forEach((l, i) => { if (/茉儿/.test(l) && /岁|成年|发育/.test(l)) console.log(`   L${i}: ${l.trim().slice(0, 150)}`); });
