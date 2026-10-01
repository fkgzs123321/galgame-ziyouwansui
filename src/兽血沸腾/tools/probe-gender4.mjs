import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书/角色';
const dirs = fs.readdirSync(ROOT, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();

// 任意缩进的 性别/年龄/身份/种族
const field = (txt, k) => {
  const m = txt.match(new RegExp('^[ \\t]*' + k + '[:：][ \\t]*(.+)$', 'm'));
  return m ? m[1].trim() : '';
};

const rows = [];
for (const d of dirs) {
  const p = path.join(ROOT, d, '基础信息.yaml');
  if (!fs.existsSync(p)) continue;
  const t = fs.readFileSync(p, 'utf8');
  const files = fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith('.yaml')).map((f) => f.replace('.yaml', ''));
  rows.push({ d, 性别: field(t, '性别'), 年龄: field(t, '年龄'), 身份: field(t, '身份'), 种族: field(t, '种族'), files });
}

const FEM = /女|母|雌|她自陈是女子/;
const MALE = /男|公$|雄|男性/;

console.log('══ 逐人性别（按条目集分组）══\n');
const buckets = {};
for (const r of rows) {
  const key = r.files.length + '件: ' + r.files.join('+');
  (buckets[key] ||= []).push(r);
}
for (const [k, v] of Object.entries(buckets).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n── ${k}  (${v.length} 人) ──`);
  for (const r of v) {
    const g = FEM.test(r.性别) ? '♀' : MALE.test(r.性别) ? '♂' : '？';
    console.log(`  ${g} ${r.d.padEnd(12)} 性别=${(r.性别 || '未标').slice(0, 26).padEnd(28)} 年龄=${(r.年龄 || '未标').slice(0, 30)}`);
  }
}

console.log('\n\n══ 性别字段为空的人（需原文确认）══');
for (const r of rows.filter((r) => !r.性别)) console.log(`  ${r.d}`);
