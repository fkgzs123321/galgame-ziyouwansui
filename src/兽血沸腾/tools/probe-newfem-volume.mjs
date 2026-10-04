// 量一下 17 位女性 NPC + 喀秋莎/塞壬/茜茜/姬丝凯碧/安瑞达 的原文分量，
// 用来判断「够不够写性格调色盘」「够不够写私密档案」。
import fs from 'fs';
const TXT = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const LINES = TXT.split('\n');

const LIST = [
  '伦娜', '依莎贝拉', '冰肌仙子', '凌波仙子', '加茜娅', '勃郎宁', '含香仙子', '巢农主母',
  '希丁克', '幽月儿', '朝河兰', '波姬小丝', '珍妮佛', '米娅', '罗浮仙子', '费雯丽', '赫莲娜',
  '喀秋莎', '塞壬', '茜茜', '姬丝凯碧', '安瑞达',
];
// 情欲强信号词（判定有无私密素材）
const SEX = /奶子|乳房|乳|胸|奶头|乳头|乳晕|阴|逼|屄|屌|鸡巴|臀|屁股|腿|足|脚|腰|腋|发|唇|舌|口|吻|肏|插|射|淫|骚|情欲|高潮|敏感|名器|初夜|破处|怀孕|受孕|体香|气味|分泌|爱液|蜜汁/;

const rows = [];
for (const n of LIST) {
  let lines = 0, sexlines = 0, first = -1, last = -1, alias = 0;
  for (let i = 0; i < LINES.length; i++) {
    const l = LINES[i];
    if (!l.includes(n)) continue;
    lines++; if (first < 0) first = i + 1; last = i + 1;
    if (SEX.test(l)) sexlines++;
  }
  // 近似别名合并统计（如 米娅·哈姆、幽月儿·杜垩登）
  const head = n.slice(0, 2);
  for (let i = 0; i < LINES.length; i++) {
    const l = LINES[i];
    if (!l.includes(head) || l.includes(n)) continue;
    if (new RegExp(head + '[·.．]').test(l)) { alias++; if (SEX.test(l)) sexlines++; }
  }
  rows.push({ n, lines: lines + alias, alias, sexlines, first, last });
}
rows.sort((a, b) => b.lines - a.lines);
console.log('角色'.padEnd(12) + '命中行'.padEnd(8) + '别名行'.padEnd(8) + '情欲行'.padEnd(8) + '首现行'.padEnd(9) + '末现行');
for (const r of rows) {
  console.log(r.n.padEnd(12) + String(r.lines).padEnd(8) + String(r.alias).padEnd(8) + String(r.sexlines).padEnd(8) + String(r.first).padEnd(9) + r.last);
}
