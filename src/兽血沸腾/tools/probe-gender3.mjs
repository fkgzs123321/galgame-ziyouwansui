import fs from 'fs';
import path from 'path';

const TXT = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const LINES = TXT.split('\n');
const ROOT = 'src/兽血沸腾/世界书/角色';

// 逐个看原文里对这几个人的「定性句」
const TARGETS = ['喀秋莎', '塞壬', '白素青', '安瑞达', '许德拉'];
const PAT = /是(?:一[个位名只头])?[^，。]{0,14}(?:女子|女孩|少女|姑娘|女人|美妇|妇人|阿姨|公主|女王|女公爵|小萝莉|女性)|(?:女婴|女子|少女|姑娘|女人|公主|女王|女公爵|小萝莉|阿姨)[^，。]{0,10}(?:喀秋莎|塞壬|白素青|安瑞达|许德拉)|(?:喀秋莎|塞壬|白素青|安瑞达|许德拉)[^，。]{0,12}(?:是男|是女|女子|女孩|男子|男孩|小萝莉|阿姨|公主|女王)|(?:他|她)(?:那|的)[^，。]{0,8}(?:俏脸|娇躯|身子)|雌性|母的|女性/;

for (const n of TARGETS) {
  console.log(`\n${'='.repeat(70)}\n  ${n}\n${'='.repeat(70)}`);
  let shown = 0;
  for (let i = 0; i < LINES.length && shown < 12; i++) {
    const l = LINES[i];
    if (!l.includes(n)) continue;
    const idx = l.indexOf(n);
    const win = l.slice(Math.max(0, idx - 70), idx + 90);
    if (PAT.test(win)) {
      console.log(`  L${i + 1}: ${win.trim()}`);
      shown++;
    }
  }
  if (!shown) console.log('  (无定性句命中)');
}

// 基础信息里现有性别字段
console.log('\n\n══ 磁盘上这几位的 性别 字段 ══');
for (const n of [...TARGETS, '唐蓓尔金娜', '海华丝', '艾莉婕', '梦露', '贞德']) {
  const p = path.join(ROOT, n, '基础信息.yaml');
  if (!fs.existsSync(p)) { console.log(`  ${n.padEnd(8)} (无目录)`); continue; }
  const t = fs.readFileSync(p, 'utf8');
  const m = t.match(/^\s+(性别|身份)[:：]\s*(.+)$/m);
  const all = [...t.matchAll(/^\s+(性别|身份|种族)[:：]\s*(.+)$/gm)].map((x) => x[1] + '=' + x[2].trim()).join(' | ');
  console.log(`  ${n.padEnd(8)} ${all}`);
}
