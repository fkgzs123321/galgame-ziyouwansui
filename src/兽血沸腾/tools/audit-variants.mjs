import fs from 'fs';
import path from 'path';

const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const SKIP = /wip|dist|\.patch-history|node_modules|兽血沸腾\.txt|兽血沸腾\.json|术语纪律|tools/;

// 已知裁定：取前一种为正
const PAIRS = [
  ['艾薇儿', '艾薇尔'],
  ['崔蓓茜', '崔蓓西'],
  ['娜迦', '那迦'],
  ['潘塔族', '猫熊'],
  ['落日大沼泽', '剑齿荒原'],
  ['龙城', '君士坦丁堡'],
  ['奥特加', '奥台加'],
  ['布尔族', '布尔人'],
  ['泰戈族', '泰格族'],
  ['幽帝', '冥帝'],
  ['云梦山', '云雾山'],
  ['迷踪飞鹭', '迷途飞鹭'],
  ['艾弗森', '艾佛森'],
  ['博格村', '博克村'],
  ['古德', '潘帅'],
  ['多瑙大荒原', '多瑙荒原'],
  ['南十字星森林', '南十字森林'],
  ['圣弗郎西斯科', '圣弗朗西斯科'],
  ['福格森.徐', '福克森'],
];

console.log('══ 异写词频（原文权威）══');
for (const [a, b] of PAIRS) {
  const ca = txt.split(a).length - 1, cb = txt.split(b).length - 1;
  const flag = cb > ca ? '  ⚠ 少数写法反而更多' : '';
  console.log(`  ${a.padEnd(12)} ${String(ca).padStart(5)}   vs  ${b.padEnd(12)} ${String(cb).padStart(5)}${flag}`);
}

console.log('\n══ 成品源码树中的少数写法出现处 ══');
(function w(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!SKIP.test(e.name + '/')) w(p); }
    else if (/\.(ya?ml|md|ts|vue)$/.test(e.name)) {
      const rel = path.relative('src/兽血沸腾', p);
      fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        for (const [a, b] of PAIRS) {
          // 若该行已含正确写法，则多数是裁定注记，跳过
          if (l.includes(b) && !l.includes(a)) {
            console.log(`  「${b}」 ${rel}:${i + 1}`);
            console.log(`      ${l.trim().slice(0, 150)}`);
          }
        }
      });
    }
  }
})('src/兽血沸腾');
