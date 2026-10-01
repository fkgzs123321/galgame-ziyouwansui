import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书/角色';
const TXT = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');

const dirs = fs.readdirSync(ROOT, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const stat = dirs.map((d) => {
  const files = fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith('.yaml')).map((f) => f.replace('.yaml', ''));
  const key = d.replace(/\..*$/, '');          // 海伦.列娜 → 海伦
  const n = TXT.split(key).length - 1;
  let lines = 0;
  const tl = TXT.split('\n');
  for (const l of tl) if (l.includes(key)) lines++;
  return { d, files, n, lines };
});

stat.sort((a, b) => b.lines - a.lines);
const full = stat.filter((s) => s.files.includes('性格调色盘'));
const basic = stat.filter((s) => !s.files.includes('性格调色盘'));

const med = (arr) => { const a = [...arr].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
const avg = (arr) => Math.round(arr.reduce((x, y) => x + y, 0) / arr.length);

console.log('══ 有「性格调色盘」的 ' + full.length + ' 人 ══');
console.log('   原文出现行数  中位 ' + med(full.map((s) => s.lines)) + '   均值 ' + avg(full.map((s) => s.lines)) + '   区间 ' + Math.min(...full.map((s) => s.lines)) + '~' + Math.max(...full.map((s) => s.lines)));
console.log('\n══ 只有「基础信息」的 ' + basic.length + ' 人 ══');
console.log('   原文出现行数  中位 ' + med(basic.map((s) => s.lines)) + '   均值 ' + avg(basic.map((s) => s.lines)) + '   区间 ' + Math.min(...basic.map((s) => s.lines)) + '~' + Math.max(...basic.map((s) => s.lines)));

console.log('\n══ 逐人（原文行数降序）══');
console.log('   ' + '姓名'.padEnd(12) + '原文行数'.padStart(8) + '  条目');
for (const s of stat) {
  const mark = s.files.includes('性格调色盘') ? '★' : ' ';
  console.log(`  ${mark} ${s.d.padEnd(12)} ${String(s.lines).padStart(7)}  ${s.files.join('+')}`);
}
