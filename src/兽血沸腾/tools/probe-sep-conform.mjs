// 全量复查：卡内正文里 15 个含分隔符人名的写法，是否与原文裁定一致。
//
// 裁定表来自 fix-name-sep.mjs（每个都实测过原文命中）：
//   原文 ASCII 点占优 → 卡内用 ASCII 点
//   原文中点占优     → 卡内用中点
// 本脚本扫 src/兽血沸腾 下所有正文文件（排除 tools/ 与源文本），
// 把「与裁定相反」的写法全部列出来。
import fs from 'fs';
import path from 'path';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 数 = s => 原.split(s).length - 1;

// [名字主体, 裁定形态]
const 裁 = [
  ['福格森|徐', '.'], ['阿里|代伊', '.'], ['青雅|白玉', '.'],
  ['罗伯特|巴乔', '.'], ['赛义德|卡斯', '.'], ['玛莉亚|高树', '.'],
  ['乔治|贝斯特', '.'], ['胡迈德|法克赫尔', '.'], ['拉蔻尔|薇芝', '.'],
  ['丽塔|海华丝', '.'], ['李察|基尔', '.'], ['西米里安|波塞顿', '.'],
  ['萨罗蒙|卡鲁', '.'], ['路易斯|菲利浦|菲高', '.'], ['格雷克|萨尔', '.'],
  ['海伦|列娜', '.'], ['拉希德|华莱士', '.'],
  ['克拉克|盖博', '·'], ['保罗|马尔蒂尼', '·'], ['加图索|丹泽', '·'],
  ['托马西|丹泽', '·'], ['大卫|贝克汉姆', '·'], ['迈克尔|泰森', '·'],
  ['托蒂|夏尔巴', '·'], ['米娅|哈姆', '·'], ['美杜莎|特雷泽盖', '·'],
  ['穆罕|阿里', '·'],
];

const ROOTS = ['src/兽血沸腾/世界书', 'src/兽血沸腾/开场白', 'src/兽血沸腾/界面', 'src/兽血沸腾/正则'];
const files = [];
(function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(yaml|yml|txt|md|ts|vue|html)$/.test(e.name)) files.push(p);
  }
})('src/兽血沸腾/世界书');
for (const d of ['src/兽血沸腾/开场白', 'src/兽血沸腾/界面', 'src/兽血沸腾/正则']) {
  (function walk(x) {
    if (!fs.existsSync(x)) return;
    for (const e of fs.readdirSync(x, { withFileTypes: true })) {
      const p = path.join(x, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(yaml|yml|txt|md|ts|vue|html)$/.test(e.name)) files.push(p);
    }
  })(d);
}

console.log(`扫描 ${files.length} 个文件\n`);
let 违 = 0;
for (const [pat, 应] of 裁) {
  const 主 = pat.replace(/\|/g, '·');            // 仅用于显示（中点形）
  const 正 = pat.replace(/\|/g, 应);             // 裁定形态
  const 误 = pat.replace(/\|/g, 应 === '.' ? '·' : '.'); // 与裁定相反的形态
  const 无 = pat.replace(/\|/g, '');            // 分隔符丢失（更严重）
  let n = 0; const where = [];
  for (const f of files) {
    const t = fs.readFileSync(f, 'utf8');
    const c = t.split(误).length - 1;
    if (!c) continue;
    n += c; where.push(`${f.replace(/\\/g, '/').replace('src/兽血沸腾/', '')}×${c}`);
  }
  const 正数 = 数(正), 误数 = 数(误);
  const flag = n ? '❌' : '✓';
  if (n) 违 += n;
  console.log(`${flag} ${主.padEnd(10)} 裁定「${正}」(原文 ${正数})   卡内错形「${误}」×${n}   本人原文错形 ${误数}`);
  if (n) console.log(`      ${where.join('  ')}`);
}
console.log(`\n共 ${违} 处与裁定相反`);
