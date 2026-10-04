import fs from 'fs';
import path from 'path';

const PROJ = 'src/兽血沸腾';
const EV = path.join(PROJ, '世界书/事件');
const files = fs.readdirSync(EV).filter(f => f.endsWith('.yaml')).sort();

const windows = files.map(f => {
  const txt = fs.readFileSync(path.join(EV, f), 'utf8');
  const l1 = txt.split('\n')[0];
  const nm = [...txt.matchAll(/getvar\('stat_data\.剧情\.章节序号', \{ defaults: 0 \}\)\s*(>=|<=)\s*(\d+)/g)].map(m => ({ op: m[1], n: Number(m[2]) }));
  const lo = Math.min(...nm.filter(x => x.op === '>=').map(x => x.n), Infinity);
  const hi = Math.max(...nm.filter(x => x.op === '<=').map(x => x.n), -Infinity);
  const abs = (txt.match(/^abstract:\s*(.+)$/m) || [, ''])[1];
  return { f: f.replace(/\.yaml$/, ''), lo, hi, abs: abs.trim() };
}).filter(w => Number.isFinite(w.lo) || Number.isFinite(w.hi)).sort((a, b) => a.lo - b.lo);

console.log(`事件条目 ${windows.length} 个\n`);
for (const w of windows) console.log(`  idx ${String(w.lo).padStart(3)}-${String(w.hi).padStart(3)}  ${w.f}`);

const NAMES = ['谭雅', '珊瑚美人', '阿仙奴', '安瑞达', '许德拉', '歌莉妮', '唐蓓尔金娜'];

console.log('\n════ 无调色盘角色：在其剧情相关事件窗口中的出现 ════');
for (const n of NAMES) {
  const hits = [];
  for (const f of files) {
    const txt = fs.readFileSync(path.join(EV, f), 'utf8');
    const c = (txt.match(new RegExp(n, 'g')) || []).length;
    if (c) { const w = windows.find(x => x.f === f.replace(/\.yaml$/, '')); hits.push(`${w ? `idx${w.lo}-${w.hi}` : '?'} ${f.replace(/\.yaml$/, '')}×${c}`); }
  }
  console.log(`\n  【${n}】`);
  hits.forEach(h => console.log(`     ${h}`));
}
