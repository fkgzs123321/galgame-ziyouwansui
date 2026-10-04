// 把卡内正文里写反了分隔符的 4 个人名改回裁定形态。
//
// 裁定来自 fix-name-sep.mjs 的 KEEP_MID 表（原文中点占优）：
//   克拉克·盖博  54:36   保罗·马尔蒂尼  5:0   托蒂·夏尔巴  1:0   穆罕·阿里  1:0
// 现状却有 17 处写成 ASCII 点形。属「卡内写法与自家裁定相抵」，必须改。
// 只替换这 4 个完整人名，不碰裸名、不碰同名的其他人（如 `保罗纽曼`、`托蒂伯爵` 条目名）。
import fs from 'fs';
import path from 'path';

const 改 = [
  ['克拉克.盖博', '克拉克·盖博'],
  ['保罗.马尔蒂尼', '保罗·马尔蒂尼'],
  ['托蒂.夏尔巴', '托蒂·夏尔巴'],
  ['穆罕.阿里', '穆罕·阿里'],
];

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
for (const [误, 正] of 改) {
  const a = 原.split(正).length - 1, b = 原.split(误).length - 1;
  console.log(`${正}  原文中点 ${a} / ASCII点 ${b}`);
  if (a === 0) throw new Error(`原文里没有「${正}」，裁定有误，中止`);
}

const files = [];
for (const d of ['世界书', '开场白', '界面', '正则']) {
  (function walk(x) {
    if (!fs.existsSync(x)) return;
    for (const e of fs.readdirSync(x, { withFileTypes: true })) {
      const p = path.join(x, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(yaml|yml|txt|md|ts|vue|html)$/.test(e.name)) files.push(p);
    }
  })(`src/兽血沸腾/${d}`);
}

console.log(`\n扫描 ${files.length} 个文件`);
let 总 = 0;
for (const [误, 正] of 改) {
  const where = [];
  for (const f of files) {
    const t = fs.readFileSync(f, 'utf8');
    const c = t.split(误).length - 1;
    if (!c) continue;
    fs.writeFileSync(f, t.split(误).join(正), 'utf8');
    总 += c;
    where.push(`${f.replace(/\\/g, '/').replace('src/兽血沸腾/', '')}×${c}`);
  }
  console.log(`  ${误} → ${正}   ${where.length} 个文件：${where.join('  ') || '（无）'}`);
}
console.log(`\n共改 ${总} 处`);
