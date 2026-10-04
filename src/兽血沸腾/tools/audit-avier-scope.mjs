import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾';
const BAD = '艾薇儿';
const GOOD = '艾薇尔';

// 排除：原文逐字引文（故事大纲 text: 行）、术语纪律裁定注记、原文 txt
const hits = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (/^(tools|node_modules|dist|\.patch-history)$/.test(e.name)) continue;
      walk(p);
    } else if (/\.(ya?ml|md|ts|vue|json)$/.test(e.name)) {
      if (/兽血沸腾\.(txt|json)$/.test(e.name) || /术语纪律|创作规划|故事大纲/.test(e.name)) continue;
      fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        if (l.includes(BAD)) hits.push({ f: path.relative(ROOT, p), n: i + 1, l: l.trim() });
      });
    }
  }
})(ROOT);

console.log(`══ 需改写的行（排除引文/裁定注记）: ${hits.length} ══`);
const byFile = {};
hits.forEach(h => (byFile[h.f] ??= []).push(h));
for (const [f, hs] of Object.entries(byFile)) {
  console.log(`\n  ${f}  (${hs.length})`);
  hs.slice(0, 8).forEach(h => console.log(`    L${h.n}: ${h.l.slice(0, 155)}`));
  if (hs.length > 8) console.log(`    …还有 ${hs.length - 8} 行`);
}

// MVU 键与路径
console.log('\n══ MVU 中 艾薇儿 作为键/路径 ══');
for (const f of ['schema.ts', '世界书/变量/变量更新规则.yaml', '世界书/变量/initvar.yaml', '开场白/initvar/6.yaml']) {
  const p = `${ROOT}/${f}`;
  if (!fs.existsSync(p)) continue;
  fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
    if (l.includes(BAD)) console.log(`  ${f}:${i + 1}  ${l.trim().slice(0, 130)}`);
  });
}
