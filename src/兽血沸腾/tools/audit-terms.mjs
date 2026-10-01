// 术语/异写一致性审计：把原文词频与产物用法并列，暴露「少数写法」「术语分裂」「幽灵名」
// 用法: node src/兽血沸腾/tools/audit-terms.mjs
import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾';
const txt = fs.readFileSync(`${ROOT}/兽血沸腾.txt`, 'utf8');
const lines = txt.split('\n');
const cnt = t => txt.split(t).length - 1;

const SKIP_DIR = /^(wip|dist|tools|开场白|世界书\/变量)$/;
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = `${d}/${e.name}`;
    if (e.isDirectory()) { if (!SKIP_DIR.test(path.relative(ROOT, p))) walk(p); }
    else if (/\.(ya?ml|md|ts|vue)$/.test(e.name)) files.push(p);
  }
})(ROOT);

function occurrences(term) {
  const out = [];
  for (const f of files) {
    fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
      if (l.includes(term)) out.push({ file: path.relative(ROOT, f), line: i + 1, text: l.trim() });
    });
  }
  return out;
}

// 每组第一个是裁定采用的写法
const GROUPS = {
  '异写（取首个）': [
    ['艾薇尔', '艾薇儿'], ['娜迦', '那迦'], ['幽帝', '冥帝'], ['艾弗森', '艾佛森'],
    ['博格村', '博克村'], ['南十字星森林', '南十字森林'], ['墨若文克', '若文诺克'],
    ['眩晕之歌', '晕眩之歌'], ['泰戈族', '泰格族'], ['圣弗郎西斯科', '圣弗朗西斯科'],
    ['福格森.徐', '福克森'], ['崔蓓茜', '崔蓓西'], ['潘帅', '潘塔'],
  ],
  '存疑专名（原文低频，须有出处）': [
    ['梵特帝国'], ['诺伊维尔公国'], ['耶斯特王国'], ['宫罔'], ['萨日里窝城'], ['地底兵工厂'],
  ],
  '战歌名（禁止自造）': [
    ['琴心战歌'], ['斯迈禁空战歌'], ['斯迈禁空之歌'], ['禁空之歌'],
  ],
};

let problems = 0;
for (const [title, groups] of Object.entries(GROUPS)) {
  console.log(`\n══ ${title} ══`);
  for (const grp of groups) {
    const counts = grp.map(t => cnt(t));
    const used = grp.map(t => occurrences(t).length);
    const dup = used.filter((n, i) => i > 0 && n > 0).length;
    const flag = dup ? '  ⚠ 组内多种写法同时出现在产物中' : '';
    if (dup) problems++;
    console.log(`  ${grp.map((t, i) => `${t}[原文${counts[i]}/产物${used[i]}]`).join('  vs  ')}${flag}`);
    if (dup) {
      grp.forEach((t, i) => {
        if (i > 0) occurrences(t).slice(0, 4).forEach(o => console.log(`        ${t} → ${o.file}:${o.line}`));
      });
    }
  }
}
console.log(`\n${problems === 0 ? '✓ 术语一致，无需处理' : `⚠ ${problems} 组存在并存写法，需裁定`}`);
