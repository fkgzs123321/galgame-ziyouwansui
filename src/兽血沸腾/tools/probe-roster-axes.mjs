import fs from 'fs';
import path from 'path';

const PROJ = 'src/兽血沸腾';
const ROSTER = ['凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝', '贞德', '白素青', '谭雅', '珊瑚美人', '阿仙奴', '安瑞达', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕'];

// 1) 关系 键
console.log('════ 关系 键 ════');
for (const f of ['世界书/变量/initvar.yaml', ...fs.readdirSync(path.join(PROJ, '开场白/initvar')).map(x => `开场白/initvar/${x}`)]) {
  const p = path.join(PROJ, f);
  if (!fs.existsSync(p)) continue;
  const txt = fs.readFileSync(p, 'utf8');
  const m = txt.match(/^关系:\n((?:[ \t]+.*\n?)*)/m);
  const keys = m ? [...m[1].matchAll(/^ {2}([^\s:][^:]*):/gm)].map(x => x[1]) : [];
  console.log(`  ${f.padEnd(28)} ${keys.length} 键: ${keys.join('、')}`);
}

// 2) 角色目录
console.log('\n════ 角色目录 ════');
const dirs = fs.readdirSync(path.join(PROJ, '世界书/角色'), { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
for (const r of ROSTER) {
  const d = dirs.find(x => x === r);
  if (!d) { console.log(`  ✗ ${r} —— 无目录！候选: ${dirs.filter(x => x.includes(r.slice(0, 2))).join('、') || '(无)'}`); continue; }
  const files = fs.readdirSync(path.join(PROJ, '世界书/角色', d));
  console.log(`  ✓ ${r.padEnd(8)} ${files.map(f => `${f}(${fs.statSync(path.join(PROJ, '世界书/角色', d, f)).size}B)`).join('  ')}`);
}

// 3) 调色盘的 EJS 轴与阈值
console.log('\n════ 调色盘 EJS 轴（照抄阈值以保持一致）════');
for (const r of ROSTER) {
  const p = path.join(PROJ, '世界书/角色', r, '性格调色盘.yaml');
  if (!fs.existsSync(p)) { console.log(`  ${r.padEnd(8)} (无调色盘)`); continue; }
  const txt = fs.readFileSync(p, 'utf8');
  const l2 = txt.split('\n')[1] || '';
  const conds = [...txt.matchAll(/<%(?:_|=)?\s*(?:if|\} else if)\s*\(([^)]*)\)/g)].map(x => x[1].replace(/\s+/g, ' ')).filter(c => /[<>]/.test(c));
  console.log(`  ${r.padEnd(8)} ${l2.trim().slice(0, 78)}`);
  if (conds.length) console.log(`           ${[...new Set(conds)].join(' | ')}`);
}
