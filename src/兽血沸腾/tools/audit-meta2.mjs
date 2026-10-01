import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书';
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.ya?ml$/.test(e.name)) files.push(p);
  }
})(ROOT);

// 元叙事专指：对着创作者/文本本身说话。排除合法用法（如「制作者」是复合词）
const META = ['原作', '本书', '写作派发规范'];
const rows = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((l, i) => {
    const hit = META.filter(w => l.includes(w));
    // 「原文」只在真的是元叙事时算，用上下文判断
    if (/(?<!本)原文/.test(l) && !/原文实名/.test(l)) hit.push('原文');
    if (hit.length) rows.push({ f: path.relative(ROOT, f).replace(/\\/g, '/'), line: i + 1, hit, text: l.trim() });
  });
}
console.log(`扫描 ${files.length} 个 yaml，元叙事命中 ${rows.length} 行\n`);
for (const r of rows) console.log(`  ${r.f}:${r.line} [${r.hit.join(',')}] ${r.text.slice(0, 170)}`);
