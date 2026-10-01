// 统一人名分隔符为原文写法。
// 裁定依据（每个都实测过原文命中数，见 probe-names-verify.mjs）：
//   原文用 ASCII 句点 → 卡内改用 ASCII 句点
//   原文用中点 ·       → 卡内改用中点
// 原文里分隔符常被打成「，」或「.」，此处按「同一人名的多数写法」归一。
import fs from 'fs';
import path from 'path';

// [卡内现状, 目标写法, 原文依据]
const TO_DOT = [
  ['福格森·徐', '福格森.徐', '113:5'],
  ['阿里·代伊', '阿里.代伊', '71:0'],
  ['青雅·白玉', '青雅.白玉', '10:1'],
  ['罗伯特·巴乔', '罗伯特.巴乔', '6:4'],
  ['赛义德·卡斯', '赛义德.卡斯', '8:0'],
  ['玛莉亚·高树', '玛莉亚.高树', '5:0'],
  ['乔治·贝斯特', '乔治.贝斯特', '3:1'],
  ['胡迈德·法克赫尔', '胡迈德.法克赫尔', '4:0'],
  ['拉蔻尔·薇芝', '拉蔻尔.薇芝', '5:0'],
  ['丽塔·海华丝', '丽塔.海华丝', '2:0'],
  ['李察·基尔', '李察.基尔', '2:0'],
  ['西米里安·波塞顿', '西米里安.波塞顿', '2:0'],
  ['萨罗蒙·卡鲁', '萨罗蒙.卡鲁', '1:0'],
  ['路易斯·菲利浦·菲高', '路易斯.菲利浦.菲高', '1:0'],
  ['格雷克·萨尔', '格雷克.萨尔', '35:33'],
  ['海伦·列娜', '海伦.列娜', '6:1'],
  ['拉希德华莱士', '拉希德.华莱士', '2:0（原文「拉希德.华莱士」）'],
];
// 不动：玛丽莲·梦露（原文「玛丽莲，梦露」2 处，中点/句点皆 0，无从裁定，保持卡内现写法）
// 不动：本·华莱士（原文「本，华莱士」2 处，中点/句点皆 0）
// 原文用中点占优，卡内已是中点 → 无需改；列出仅作记录
const KEEP_MID = ['克拉克·盖博 54:36', '保罗·马尔蒂尼 5:0', '加图索·丹泽 2:1',
  '托马西·丹泽 2:0', '大卫·贝克汉姆 2:0', '迈克尔·泰森 2:0', '托蒂·夏尔巴 1:0',
  '米娅·哈姆 1:0', '美杜莎·特雷泽盖 1:0', '穆罕·阿里 1:0', '本·华莱士（原文「本，华莱士」）'];

const ROOTS = ['src/兽血沸腾/世界书', 'src/兽血沸腾/开场白', 'src/兽血沸腾/界面'];
const files = [];
(function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(yaml|txt|md|ts|vue)$/.test(e.name)) files.push(p);
  }
})('src/兽血沸腾/世界书');
(function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/\.(yaml|txt|md)$/.test(e.name)) files.push(p);
  }
})('src/兽血沸腾/开场白');
(function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/\.(ts|vue|md)$/.test(e.name)) files.push(p);
  }
})('src/兽血沸腾/界面');

console.log(`扫描 ${files.length} 个文件\n`);
const log = [];
for (const [from, to, ev] of TO_DOT) {
  let n = 0; const where = [];
  for (const f of files) {
    const t = fs.readFileSync(f, 'utf8');
    const c = t.split(from).length - 1;
    if (!c) continue;
    fs.writeFileSync(f, t.split(from).join(to), 'utf8');
    n += c; where.push(`${f.replace(/\\/g, '/').replace('src/兽血沸腾/', '')}×${c}`);
  }
  log.push([from, to, n, ev, where]);
}
console.log('原写法'.padEnd(22) + '新写法'.padEnd(24) + '处数'.padEnd(6) + '原文依据');
console.log('─'.repeat(80));
let tot = 0;
for (const [from, to, n, ev, where] of log) {
  tot += n;
  console.log(`${from.padEnd(22)}${to.padEnd(24)}${String(n).padEnd(6)}${ev}`);
  if (n) console.log(`     ${where.join('  ')}`);
}
console.log(`\n共改 ${tot} 处`);
console.log('\n── 维持中点（原文中点占优）──');
KEEP_MID.forEach(s => console.log(`   ${s}`));
