import fs from 'fs';
import path from 'path';
const R = 'src/兽血沸腾/世界书/事件';
const rows = [];
for (const f of fs.readdirSync(R).filter(x => x.endsWith('.yaml')).sort()) {
  const t = fs.readFileSync(path.join(R, f), 'utf8');
  const l1 = t.split('\n')[0];
  const m = l1.match(/>=\s*(\d+).*?<=\s*(\d+)/);
  const title = (t.split('\n').find(l => /^[^\s#][^:]*:\s*$/.test(l)) || '').replace(/:$/, '');
  rows.push({ f: f.replace(/\.yaml$/, ''), lo: m ? +m[1] : -1, hi: m ? +m[2] : -1, title });
}
rows.sort((a, b) => a.lo - b.lo);
for (const r of rows) console.log(`${String(r.lo).padStart(4)}-${String(r.hi).padStart(4)}  ${r.f}`);
console.log(`\n共 ${rows.length} 个事件条目`);
