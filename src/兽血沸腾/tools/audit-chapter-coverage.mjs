// 核验「全部剧情做出来」：764 章的剧情覆盖是否无缺口。
//
// 三条覆盖路径：
//   ① 事件/ 48 个条目，各自 @@if 圈定的章节区间
//   ② 时间线/*编年 7 篇 + *纪，各自进度窗口
//   ③ 角色/NPC 条目的 私密阶段/性格调色盘 分档阈值
// 这里检查 ① 的区间是否拼成一个无洞的 [0,763] 覆盖。
import fs from 'fs';
import path from 'path';

const 事件目录 = 'src/兽血沸腾/世界书/事件';
const 区间 = [];

for (const f of fs.readdirSync(事件目录).sort()) {
  if (!f.endsWith('.yaml')) continue;
  const t = fs.readFileSync(path.join(事件目录, f), 'utf8');
  // 抓 @@if … >= N … <= M
  const 低 = [...t.matchAll(/>=\s*(\d+)/g)].map(m => +m[1]);
  const 高 = [...t.matchAll(/<=\s*(\d+)/g)].map(m => +m[1]);
  // 只取第一行条件里的（首个 @@if）
  const 首行 = t.split('\n').find(l => l.includes('@@if')) ?? '';
  const a = 首行.match(/>=\s*(\d+)/);
  const b = 首行.match(/<=\s*(\d+)/);
  区间.push([f.replace('.yaml', ''), a ? +a[1] : null, b ? +b[1] : null, t.includes('@@if')]);
}

console.log(`══ 事件条目 ${区间.length} 个 ══\n`);
const 带守卫 = 区间.filter(x => x[1] !== null);
const 无守卫 = 区间.filter(x => x[1] === null);

console.log(`带章节区间的：${带守卫.length} 个`);
console.log(`无章节区间的：${无守卫.length} 个${无守卫.length ? ' → ' + 无守卫.map(x => x[0]).join(' · ') : ''}`);

// 用区间端点检查 0..763 是否被覆盖
console.log('\n── 区间明细（按起始排序）──');
for (const [n, a, b] of 带守卫.sort((x, y) => x[1] - y[1])) {
  console.log(`   ${n.padEnd(30)} ${String(a).padStart(4)} → ${String(b).padStart(4)}`);
}

// 覆盖分析
const 点 = new Array(764).fill(0);
for (const [, a, b] of 带守卫) if (a !== null) for (let i = Math.max(0, a); i <= Math.min(763, b ?? a); i++) 点[i]++;
const 洞 = [];
let 起 = -1;
for (let i = 0; i <= 763; i++) {
  if (点[i] === 0) { if (起 < 0) 起 = i; }
  else if (起 >= 0) { 洞.push([起, i - 1]); 起 = -1; }
}
if (起 >= 0) 洞.push([起, 763]);

console.log(`\n══ 章节覆盖：0–763 中未被任何事件条目覆盖的段落 ══`);
if (!洞.length) console.log('   ✓ 无缺口');
else for (const [a, b] of 洞) console.log(`   ${a} – ${b}  (${b - a + 1} 章)`);
const 覆 = 点.filter(x => x > 0).length;
console.log(`   覆盖 ${覆}/764 章（${(覆 / 764 * 100).toFixed(1)}%），重叠处最大 ${Math.max(...点)} 条`);
