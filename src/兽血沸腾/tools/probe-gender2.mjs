import fs from 'fs';

const TXT = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const LINES = TXT.split('\n');
const NAMES = ['喀秋莎', '塞壬', '安瑞达', '海华丝', '唐蓓尔金娜', '艾莉婕', '白素青', '许德拉', '梦露', '贞德', '姬丝凯碧', '茜茜', '茉儿', '海伦'];

const G = ['女子', '女人', '女孩', '少女', '姑娘', '小姐', '夫人', '公主', '女王', '女人味', '她', '美女', '女性', '妹子', '尼姑', '修女', '主母', '小姐'];
const B = ['男子', '男人', '男孩', '少年', '汉子', '先生', '陛下', '他', '男性', '老头', '大爷', '小伙子'];

for (const n of NAMES) {
  let g = 0, b = 0;
  const ev = [];
  for (const line of LINES) {
    if (!line.includes(n)) continue;
    for (const w of G) if (line.includes(w)) g++;
    for (const w of B) if (line.includes(w)) b++;
    if (ev.length < 3 && (line.includes('是男') || line.includes('是女') || line.includes('男性') || line.includes('女性') || line.includes('女子') || line.includes('男子'))) ev.push(line.trim().slice(0, 90));
  }
  console.log(`\n══ ${n} ══ 女向词 ${g} · 男向词 ${b}`);
  ev.forEach((e) => console.log('   ' + e));
}
