import fs from 'fs';

const P = 'src/兽血沸腾/故事大纲.yaml';
const lines = fs.readFileSync(P, 'utf8').split('\n');

// text: 字段是原文逐字引文，绝不能改；其余（notes/summary/reason/name/context/relationship…）是我们的转述，应统一
const indentOf = s => s.length - s.trimStart().length;

function isQuoteBlock(i) {
  const t = lines[i].trimStart();
  if (/^text:/.test(t)) return true;
  // 若某一行祖先（缩进更浅的 text:）仍在本引文块内，则本行是引文续行
  for (let j = i - 1; j >= 0 && j > i - 12; j--) {
    const p = lines[j].trimStart();
    if (/^text:/.test(p)) return indentOf(lines[i]) > indentOf(lines[j]);
    if (/^-\s|^\w+:/.test(p) && indentOf(lines[j]) <= indentOf(lines[i])) break;
  }
  return false;
}

const RULES = [
  ['那迦', '娜迦'],
  ['艾佛森', '艾弗森'],
  ['福克森', '福格森'],
  ['崔蓓西', '崔蓓茜'],
  ['南十字森林', '南十字星森林'],
  ['若文诺克', '墨若文克'],
  ['琴心战歌', '琴心'],
  ['博克村', '博格村'],
  ['晕眩之歌', '眩晕之歌'],
  ['艾薇儿', '艾薇尔'],
  ['冥帝', '幽帝'],
];
// 福格森·徐 / 福克森·徐 的半角点统一
const SKIP_QUOTE = true;

let changed = 0, quoteHits = 0;
const out = lines.map((l, i) => {
  if (isQuoteBlock(i)) {
    for (const [bad] of RULES) if (l.includes(bad)) quoteHits++;
    return l;
  }
  let nl = l;
  for (const [bad, good] of RULES) nl = nl.replaceAll(bad, good);
  // 修掉「福格森.徐」的其它分隔号写法
  nl = nl.replace(/福格森[·・.．]徐/g, '福格森.徐');
  if (nl !== l) changed++;
  return nl;
});

fs.writeFileSync(P, out.join('\n'), 'utf8');
console.log(`改写 ${changed} 行；引文块中跳过 ${quoteHits} 处（原文引文保持逐字不变）`);

// 报告跳过的引文位置，便于人工确认
console.log('\n引文中保留的异写（应保持原样）：');
out.forEach((l, i) => {
  if (isQuoteBlock(i) && RULES.some(([b]) => l.includes(b))) {
    console.log(`  L${i + 1}: ${l.trim().slice(0, 150)}`);
  }
});
