import fs from 'fs';
import path from 'path';
const R = 'src/兽血沸腾/世界书/时间线';
console.log('文件'.padEnd(24) + '字节'.padEnd(9) + '行'.padEnd(6) + 'L1守卫');
console.log('─'.repeat(70));
for (const f of fs.readdirSync(R).filter(x => x.endsWith('.yaml')).sort()) {
  const t = fs.readFileSync(path.join(R, f), 'utf8');
  const lines = t.split('\n');
  const l1 = (lines[0] ?? '').trim();
  const l2 = (lines[1] ?? '').trim();
  const l3 = (lines[2] ?? '').trim();
  const isGuard = /^@@if getvar\('stat_data\.剧情\.章节序号'/.test(l1);
  const isPriv = l1 === '@@private';
  let tag = '·  无守卫';
  if (isGuard) tag = '✓  @@if 首行';
  else if (isPriv) tag = '✓  @@private + ' + (l2.includes('const') ? (l3.includes('if') ? 'const+if' : 'const') : '?');
  console.log(`${f.padEnd(24)}${String(t.length).padEnd(9)}${String(lines.length - 1).padEnd(6)}${tag}`);
  if (isPriv) { console.log(`      L2 ${l2.slice(0, 70)}`); if (l3.includes('if')) console.log(`      L3 ${l3.slice(0, 70)}`); }
}
const all = fs.readdirSync(R).filter(x => x.endsWith('.yaml'));
const guarded = all.filter(f => {
  const t = fs.readFileSync(path.join(R, f), 'utf8');
  return /^@@if getvar\('stat_data\.剧情\.章节序号'/.test(t) || t.startsWith('@@private');
});
console.log(`\n共 ${all.length} 个文件，已守卫 ${guarded.length} 个，未守卫 ${all.length - guarded.length} 个`);
const un = all.filter(f => !guarded.includes(f));
if (un.length) { console.log('\n未守卫：'); un.forEach(f => console.log('   ' + f)); }
