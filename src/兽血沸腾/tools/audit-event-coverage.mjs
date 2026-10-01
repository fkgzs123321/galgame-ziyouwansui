// 只读探针：统计 事件/ 与 时间线/ 对 0~763 章节序号的覆盖情况。
import fs from 'fs';
import path from 'path';

const R = 'src/兽血沸腾/世界书/事件';
const walk = d =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)],
  );

const files = walk(R).filter(f => f.endsWith('.yaml'));
const rows = [];
let tot = 0;
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  tot += Buffer.byteLength(t);
  // @@if ... >= N && ... <= M
  const ge = [...t.matchAll(/章节序号[^&|]*?>=\s*(\d+)/g)].map(m => +m[1]);
  const le = [...t.matchAll(/章节序号[^&|]*?<=\s*(\d+)/g)].map(m => +m[1]);
  const eq = [...t.matchAll(/章节序号[^&|]*?==\s*(\d+)/g)].map(m => +m[1]);
  const all = [...ge, ...le, ...eq];
  rows.push({
    f: path.basename(f),
    lo: all.length ? Math.min(...all) : null,
    hi: all.length ? Math.max(...all) : null,
    n: all.length,
  });
}

const 无守卫 = rows.filter(r => r.lo === null);
const 有守卫 = rows.filter(r => r.lo !== null).sort((a, b) => a.lo - b.lo);

console.log(`事件文件 ${rows.length} 个，合计 ${tot} B`);
console.log(`  带章节守卫 ${有守卫.length} 个，无守卫 ${无守卫.length} 个`);
if (无守卫.length) 无守卫.forEach(r => console.log('    无守卫: ' + r.f));

// 覆盖区间
let cur = 0;
const gaps = [];
for (const r of 有守卫) {
  if (r.lo > cur) gaps.push([cur, r.lo - 1]);
  cur = Math.max(cur, r.hi + 1);
}
if (cur < 764) gaps.push([cur, 763]);
console.log(`  守卫覆盖到序号 ${cur - 1}`);
const 实质 = gaps.filter(([a, b]) => b - a + 1 > 3);
console.log(
  `  未覆盖区间(>3章): ${实质.length ? 实质.map(([a, b]) => `${a}~${b}(${b - a + 1}章)`).join(' | ') : '无'}`,
);
const 零散 = gaps.filter(([a, b]) => b - a + 1 <= 3);
console.log(`  零散缺口(<=3章): ${零散.length ? 零散.map(([a, b]) => (a === b ? `${a}` : `${a}~${b}`)).join(', ') : '无'}`);

// 重叠检测
console.log('\n── 相邻事件的重叠 ──');
for (let i = 1; i < 有守卫.length; i++) {
  const p = 有守卫[i - 1], c = 有守卫[i];
  if (c.lo <= p.hi) console.log(`  ${p.f}[${p.lo}-${p.hi}] 与 ${c.f}[${c.lo}-${c.hi}] 重叠`);
}
