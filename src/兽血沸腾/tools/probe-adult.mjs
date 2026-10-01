import fs from 'fs';
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');

const probe = (re, label, max = 10) => {
  const out = [];
  lines.forEach((l, i) => { if (re.test(l)) out.push([i + 1, l.trim()]); });
  console.log(`\n══ ${label} — ${out.length} 行 ══`);
  for (const [n, l] of out.slice(0, max)) console.log(`  L${n}: ${l.slice(0, 160)}`);
  if (out.length > max) console.log(`  … 余 ${out.length - max} 行`);
};

probe(/成年礼/, '成年礼 全部');
probe(/海伦[^。]{0,30}(婚|嫁|妻|夫人)/, '海伦 婚嫁');
probe(/茉儿[^。]{0,40}(婚|妻|嫁|成年|长大)/, '茉儿 婚嫁/长大');
probe(/茜茜[^。]{0,40}(婚|妻|嫁|成年)/, '茜茜 婚嫁/成年');
probe(/姬丝凯碧[^。]{0,40}(婚|妻|嫁|成年|长大)/, '姬丝凯碧 婚嫁');
