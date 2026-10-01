import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书/角色';
const dirs = fs.readdirSync(ROOT, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);

const rows = [];
for (const d of dirs) {
  const base = path.join(ROOT, d, '基础信息.yaml');
  let txt = '';
  if (fs.existsSync(base)) txt = fs.readFileSync(base, 'utf8');
  const get = re => { const m = txt.match(re); return m ? m[1].trim() : ''; };
  const sex = get(/^\s{2}性别:\s*(.+)$/m);
  const age = get(/^\s{2}年龄:\s*(.+)$/m);
  const race = get(/^\s{2}种族:\s*(.+)$/m);
  const id = get(/^\s{2}身份:\s*(.+)$/m);
  const hasPrivate = fs.existsSync(path.join(ROOT, d, '私密.yaml')) || fs.existsSync(path.join(ROOT, d, '私密档案.yaml'));
  rows.push({ d, sex, age, race, id, hasPrivate, size: txt.length });
}

const F = rows.filter(r => r.sex.includes('女') || r.sex === '');
const M = rows.filter(r => r.sex.includes('男'));
console.log(`共 ${rows.length} 个角色目录，女/未标 ${F.length}，男 ${M.length}\n`);

console.log('══ 女性或未标性别（私密档案候选）══');
console.log('  目录'.padEnd(20) + '年龄'.padEnd(12) + '种族'.padEnd(22) + '私密');
for (const r of F.sort((a, b) => b.size - a.size)) {
  console.log(`  ${r.d.padEnd(18)} ${(r.age || '-').padEnd(10)} ${(r.race || '-').padEnd(20)} ${r.hasPrivate ? '✓' : ''}`);
}

console.log('\n══ 男性 ══');
console.log('  ' + rows.filter(r => r.sex.includes('男')).map(r => `${r.d}(${r.age || '-'})`).join('、'));
