import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾';
const BAD = '艾薇儿';
const GOOD = '艾薇尔';

// 这些文件里的 BAD 是「裁定注记」，必须保留
const KEEP = [
  /术语纪律\.md$/,
  /故事大纲\.yaml$/, // 逐字引文 text: 行保留原文
  /兽血沸腾\.(txt|json)$/,
  /tools[\\/]/,
];

function keep(p) { return KEEP.some(r => r.test(p)); }

const report = [];
function fixFile(p, { allowQuote = false } = {}) {
  const src = fs.readFileSync(p, 'utf8');
  if (!src.includes(BAD)) return;
  const lines = src.split('\n');
  let n = 0;
  const out = lines.map(l => {
    if (!allowQuote && /^\s*text:/.test(l)) return l; // 逐字引文
    if (!l.includes(BAD)) return l;
    n++;
    return l.replaceAll(BAD, GOOD);
  });
  if (n) { fs.writeFileSync(p, out.join('\n'), 'utf8'); report.push([path.relative(ROOT, p), n]); }
}

// 1) 目录改名
const oldDir = path.join(ROOT, '世界书/角色', BAD);
const newDir = path.join(ROOT, '世界书/角色', GOOD);
if (fs.existsSync(oldDir)) {
  fs.renameSync(oldDir, newDir);
  console.log(`目录改名: 世界书/角色/${BAD} → 世界书/角色/${GOOD}`);
}

// 2) 内容替换
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/^(tools|node_modules|dist|\.patch-history)$/.test(e.name)) walk(p); }
    else if (/\.(ya?ml|md|ts|vue|json|txt)$/.test(e.name)) {
      if (keep(p)) continue;
      fixFile(p, { allowQuote: !/故事大纲/.test(p) });
    }
  }
})(ROOT);

console.log(`\n改写文件数: ${report.length}，共 ${report.reduce((a, [, n]) => a + n, 0)} 行`);
report.sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([f, n]) => console.log(`  ${String(n).padStart(4)}  ${f}`));
if (report.length > 20) console.log(`  …还有 ${report.length - 20} 个文件`);
