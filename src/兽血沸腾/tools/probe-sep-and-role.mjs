import fs from 'fs';
import path from 'path';
const raw = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const C = s => raw.split(s).length - 1;

console.log('════ 1. 三个临界人名 ════');
for (const [mid, dot] of [['本·华莱士', '本.华莱士'], ['拉希德·华莱士', '拉希德.华莱士'],
  ['格雷克·萨尔', '格雷克.萨尔'], ['海伦·列娜', '海伦.列娜'], ['莲·梦露', '莲.梦露'],
  ['玛丽莲·梦露', '玛丽莲.梦露']]) {
  console.log(`  ${mid.padEnd(18)} 中点 ${C(mid)}  ASCII ${C(dot)}`);
}
console.log('  原文逗号变体: 本，华莱士 =', C('本，华莱士'), ' 拉希德，华莱士 =', C('拉希德，华莱士'), ' 玛丽莲，梦露 =', C('玛丽莲，梦露'));

console.log('\n════ 2. 原文外国人名分隔符总倾向（抽样 30 个已知人名）════');
const SAMPLE = ['克拉克·盖博', '保罗·马尔蒂尼', '大卫·贝克汉姆', '加图索·丹泽', '托马西·丹泽',
  '格雷克·萨尔', '福格森·徐', '阿里·代伊', '海伦·列娜', '罗伯特·巴乔', '迈克尔·泰森',
  '米娅·哈姆', '托蒂·夏尔巴', '美杜莎·特雷泽盖', '穆罕·阿里', '丹尼斯·博格坎普',
  '青雅·白玉', '赛义德·卡斯', '胡迈德·法克赫尔', '拉蔻尔·薇芝', '丽塔·海华丝',
  '李察·基尔', '西米里安·波塞顿', '萨罗蒙·卡鲁', '莲·梦露', '玛莉亚·高树',
  '乔治·贝斯特', '路易斯·菲利浦·菲高', '米歇尔·普拉蒂尼', '幽月儿·杜垩登'];
let mTot = 0, dTot = 0, mWin = 0, dWin = 0;
for (const n of SAMPLE) {
  const d = C(n.replace(/·/g, '.')), m = C(n);
  mTot += m; dTot += d;
  if (m > d) mWin++; else if (d > m) dWin++;
}
console.log(`  中点胜 ${mWin} 个 / 句点胜 ${dWin} 个`);
console.log(`  中点合计 ${mTot} 处 / 句点合计 ${dTot} 处`);

console.log('\n════ 3. 普斯卡什 是否已有独立角色条目 ════');
const roleDir = 'src/兽血沸腾/世界书/角色';
for (const d of fs.readdirSync(roleDir, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  if (/普斯卡什|贞德|冬五|唐藏|贝克汉姆|菲高|贝肯鲍尔/.test(d.name)) {
    const fs_ = fs.readdirSync(path.join(roleDir, d.name));
    console.log(`  ✓ 角色/${d.name}/  →  ${fs_.map(x => `${x}(${fs.statSync(path.join(roleDir, d.name, x)).size}B)`).join('  ')}`);
  }
}
console.log('  ── 角色速览 里这 5 人的行 ──');
const cat = fs.readFileSync('src/兽血沸腾/世界书/角色/角色速览.yaml', 'utf8').split('\n');
cat.forEach((l, i) => {
  if (/普斯卡什|贞德|冬五|唐藏|贝克汉姆|菲高|贝肯鲍尔/.test(l)) console.log(`    L${i + 1}: ${l.trim()}`);
});
