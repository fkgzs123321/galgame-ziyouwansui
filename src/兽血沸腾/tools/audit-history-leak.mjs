// 全面测量：每个「纪」文件里哪些节点含后期剧情（结局/终盘/中后期）标记。
// 只读，不改文件。
import fs from 'fs';
import path from 'path';
const R = 'src/兽血沸腾/世界书/时间线';

// 标记 → 原文中最早出现的章节序号（保守下界）
const MARK = [
  // 终盘 705-763
  ['茵格里切宝', 705], ['小空', 705], ['小净', 705], ['介丘', 705], ['介丘节', 705],
  ['被遗忘国度', 705], ['遗忘历', 705], ['卢塞恩', 705], ['太子', 705], ['刘抗美', 705],
  ['胡须迎客', 705], ['幻境', 705], ['幕后黑手', 705], ['大结局', 705],
  // 扩张期 245-704
  ['神曲萨满', 245], ['神曲光环', 245], ['时空大裂缝', 245], ['权杖祭祀', 245],
  ['教宗', 245], ['嘉宝', 245], ['梦露', 245], ['贞德', 245], ['谭雅', 245],
  ['果果', 73], ['壹条', 73], ['穆里尼奥', 73], ['翡冷翠', 73], ['刘震撼', 43],
  ['李察', 43], ['圣奇奥', 73], ['恐惧魔王', 245], ['巫妖王', 245],
  // 成长期 73-244
  ['花廷', 73], ['花相', 73], ['花王', 73], ['神曲', 73], ['介丘海加尔', 705],
];

const files = fs.readdirSync(R).filter(f => f.endsWith('.yaml'));
const report = [];
for (const f of files) {
  const lines = fs.readFileSync(path.join(R, f), 'utf8').split('\n');
  if (lines[0].startsWith('@@')) continue; // 已有守卫
  // 顶层节点切分
  const heads = [];
  lines.forEach((l, i) => { if (/^[^\s#][^:]*:\s*$/.test(l)) heads.push({ i, k: l.replace(/:.*$/, '') }); });
  for (let h = 0; h < heads.length; h++) {
    const start = heads[h].i;
    const end = h + 1 < heads.length ? heads[h + 1].i : lines.length;
    const body = lines.slice(start + 1, end).join('\n');
    const tm = body.match(/^\s*时间:\s*(.+)$/m);
    const found = MARK.filter(([k]) => body.includes(k));
    if (!found.length) continue;
    const minChap = Math.min(...found.map(([, c]) => c));
    report.push({ f, node: heads[h].k, line: start + 1, tm: tm ? tm[1].trim() : '', minChap, marks: found.map(([k]) => k) });
  }
}
// 按文件分组输出
let cur = '';
for (const r of report) {
  if (r.f !== cur) { cur = r.f; console.log(`\n══ ${r.f} ══`); }
  console.log(`  L${String(r.line).padStart(4)} ${r.node}`);
  console.log(`        时间: ${r.tm || '(无)'}`);
  console.log(`        ≥${r.minChap}  标记: ${r.marks.slice(0, 10).join('、')}`);
}
const byFile = {};
for (const r of report) (byFile[r.f] ??= []).push(r);
console.log(`\n\n══ 汇总：每个文件需守卫的最早章节 ══`);
for (const [f, rs] of Object.entries(byFile)) {
  const mn = Math.min(...rs.map(r => r.minChap));
  console.log(`  ${f.padEnd(24)} 最早 ≥${String(mn).padStart(3)}   需守卫节点 ${rs.length} 个`);
}
