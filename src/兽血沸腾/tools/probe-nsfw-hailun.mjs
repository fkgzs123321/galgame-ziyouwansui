import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');

// 海伦 是否在后文被"长大"/成年
const probe = (re, label, max = 8) => {
  const out = [];
  lines.forEach((l, i) => { if (re.test(l)) out.push([i + 1, l.trim()]); });
  console.log(`\n══ ${label} — 共 ${out.length} 行，示前 ${Math.min(max, out.length)} ══`);
  for (const [n, l] of out.slice(0, max)) console.log(`  L${n}: ${l.slice(0, 165)}`);
};

probe(/海伦[^。]{0,40}(成年|长大|十八岁|十七岁|十六岁)/, '海伦 成年/长大');
probe(/茉儿[^。]{0,30}(成年|长大|十八|十六)/, '茉儿 长大');
probe(/(圆房|合房|洞房)/, '圆房/洞房');
probe(/海伦[^。]{0,50}(初夜|第一次|床上|赤身|裸)/, '海伦 亲密');

console.log('\n══ 海伦 出现在"怀孕/临盆/分娩"同句 ══');
let c = 0;
lines.forEach((l, i) => {
  if (/海伦/.test(l) && /(怀孕|临盆|分娩|怀了|有孕|生下)/.test(l) && c++ < 8) {
    console.log(`  L${i + 1}: ${l.trim().slice(0, 165)}`);
  }
});
console.log(`  （共 ${c} 行）`);
