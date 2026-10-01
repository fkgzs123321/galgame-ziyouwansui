import fs from 'fs';
const raw = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const cnt = s => raw.split(s).length - 1;

// 卡内出现的、与原文写法冲突的人名（仅完整人名，排除「第X章·标题」结构）
const NAMES = [
  '福格森·徐', '阿里·代伊', '青雅·白玉', '罗伯特·巴乔', '赛义德·卡斯',
  '海伦·列娜', '玛莉亚·高树', '玛利亚·高树', '乔治·贝斯特', '胡迈德·法克赫尔',
  '拉蔻尔·薇芝', '丽塔·海华丝', '李察·基尔', '西米里安·波塞顿', '萨罗蒙·卡鲁',
  '路易斯·菲利浦·菲高', '莲·梦露', '格雷克·萨尔', '克拉克·盖博',
  '保罗·马尔蒂尼', '加图索·丹泽', '托马西·丹泽', '大卫·贝克汉姆',
];
console.log('人名'.padEnd(22) + '中点·'.padEnd(8) + 'ASCII.'.padEnd(8) + '原文判定');
console.log('─'.repeat(64));
for (const n of NAMES) {
  const a = n.replace(/\./g, '·'), b = n.replace(/·/g, '.');
  const ca = cnt(a), cb = cnt(b);
  const verdict = cb > ca ? `ASCII . （${cb}:${ca}）` : ca > cb ? `中点 · （${ca}:${cb}）` : `平手 ${ca}`;
  console.log(`${n.padEnd(22)}${String(ca).padEnd(8)}${String(cb).padEnd(8)}${verdict}`);
}
console.log('\n── 高树女公爵 的原文写法抽样 ──');
for (const q of ['玛莉亚', '玛利亚', '高树女公爵']) {
  const ms = [...raw.matchAll(new RegExp(q, 'g'))];
  console.log(`  ${q}: ${ms.length} 处`);
  for (const m of ms.slice(0, 2)) {
    const s = Math.max(0, m.index - 40);
    console.log(`     …${raw.slice(s, s + 90).replace(/\n/g, ' ')}…`);
  }
}
console.log('\n── 卡内「玛利亚」出现位置 ──');
