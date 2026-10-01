import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');
const hit = (re, label, max = 6) => {
  const out = [];
  lines.forEach((l, i) => { if (re.test(l) && out.length < max) out.push([i + 1, l.trim()]); });
  console.log(`\n══ ${label} (${out.length}) ══`);
  for (const [n, l] of out) console.log(`  L${n}: ${l.slice(0, 170)}`);
};

hit(/海伦[^。]{0,25}(十五|十六|十七|十八|成年|成年礼)/, '海伦 年龄/成年');
hit(/(海伦|小狐狸)[^。]{0,30}(结婚|完婚|婚礼|成亲)/, '海伦 婚事');
hit(/茉儿[^。]{0,20}(十四|十五|十六|成年)/, '茉儿 年龄');
hit(/茜茜[^。]{0,25}(成年|婚|十四|十五)/, '茜茜 成年');
hit(/艾薇尔[^。]{0,20}(十七|十八|成年)/, '艾薇尔 年龄');
hit(/姬丝凯碧[^。]{0,25}(年龄|岁|成年)/, '姬丝凯碧');

console.log('\n══ 关键词总计数 ══');
for (const w of ['成年礼', '指婚', '初夜', '圆房', '侍寝', '怀孕', '分娩', '临盆']) {
  console.log(`  ${w}: ${(t.match(new RegExp(w, 'g')) || []).length}`);
}
