import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书';
const rows = [];
const walk = (dir, files) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, files);
    else if (/\.ya?ml$/.test(f.name)) files.push({ f: path.relative(ROOT, p), b: fs.statSync(p).size });
  }
};
for (const type of fs.readdirSync(ROOT)) {
  const d = path.join(ROOT, type);
  if (!fs.statSync(d).isDirectory()) continue;
  const files = [];
  walk(d, files);
  const bytes = files.reduce((s, x) => s + x.b, 0);
  rows.push({ type, n: files.length, bytes, files });
}
rows.sort((a, b) => b.bytes - a.bytes);

console.log('类型'.padEnd(12) + '文件'.padStart(5) + '总字节'.padStart(11) + '均值'.padStart(9) + '最小'.padStart(9) + '最大'.padStart(9));
let tb = 0, tn = 0;
for (const r of rows) {
  const bs = r.files.map(x => x.b);
  tb += r.bytes; tn += r.n;
  console.log(
    r.type.padEnd(12) + String(r.n).padStart(5) + String(r.bytes).padStart(11) +
    String(Math.round(r.bytes / r.n)).padStart(9) + String(Math.min(...bs)).padStart(9) + String(Math.max(...bs)).padStart(9),
  );
}
console.log('─'.repeat(55));
console.log('合计'.padEnd(12) + String(tn).padStart(5) + String(tb).padStart(11) + String(Math.round(tb / tn)).padStart(9));

// 偏薄条目
console.log('\n══ 低于 3,000 B 的条目（偏薄，按大小升序）══');
const thin = [];
for (const r of rows) for (const x of r.files) if (x.b < 3000) thin.push({ ...x, type: r.type });
thin.sort((a, b) => a.b - b.b);
thin.forEach(x => console.log(`  ${String(x.b).padStart(6)}  ${x.type}/${x.f}`));
console.log(`  共 ${thin.length} 篇偏薄`);
