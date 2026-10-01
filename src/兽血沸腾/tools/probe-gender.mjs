import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书/角色';
const TXT = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');

const dirs = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory()).map((e) => e.name).sort();

// 从 基础信息.yaml 里抽 性别 / 年龄
const pick = (txt, keys) => {
  for (const k of keys) {
    const m = txt.match(new RegExp('^\\s{2}' + k + '[:：]\\s*(.+)$', 'm'));
    if (m) return m[1].trim().replace(/^["'「]|["'」]$/g, '');
  }
  return '';
};

console.log('姓名'.padEnd(13) + '性别'.padEnd(6) + '年龄'.padEnd(22) + '条目');
console.log('─'.repeat(100));
const rows = [];
for (const d of dirs) {
  const p = path.join(ROOT, d, '基础信息.yaml');
  if (!fs.existsSync(p)) continue;
  const t = fs.readFileSync(p, 'utf8');
  const files = fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith('.yaml')).map((f) => f.replace('.yaml', ''));
  const sex = pick(t, ['性别']);
  const age = pick(t, ['年龄']);
  rows.push({ d, sex, age, files });
  const mark = files.includes('性格调色盘') ? '★' : ' ';
  console.log(`${mark}${d.padEnd(12)}${(sex || '—').padEnd(6)}${(age || '—').slice(0, 20).padEnd(22)}${files.join('+')}`);
}

const fem = rows.filter((r) => /女/.test(r.sex));
const male = rows.filter((r) => /男/.test(r.sex));
const unk = rows.filter((r) => !/女|男/.test(r.sex));
console.log('\n══ 小计 ══');
console.log('  女 ' + fem.length + ' · 男 ' + male.length + ' · 性别未标 ' + unk.length + ' · 合计 ' + rows.length);
console.log('\n  性别未标: ' + (unk.map((r) => r.d + '(' + r.sex + ')').join('、') || '(无)'));

const femNoPal = fem.filter((r) => !r.files.includes('性格调色盘'));
console.log('\n══ 女性但【没有】性格调色盘 ' + femNoPal.length + ' 人 ══');
for (const r of femNoPal) {
  const lines = TXT.split('\n').filter((l) => l.includes(r.d.replace(/\..*$/, ''))).length;
  console.log(`  ${r.d.padEnd(12)} ${(r.age || '—').padEnd(20)} 原文 ${String(lines).padStart(5)} 行`);
}

const femPriv = fem.filter((r) => r.files.includes('私密'));
console.log('\n══ 女性且有 私密/私密阶段 ' + femPriv.length + ' 人 ══');
console.log('  ' + femPriv.map((r) => r.d).join('、'));
const femNoPriv = fem.filter((r) => !r.files.includes('私密'));
console.log('\n══ 女性但【没有】私密 ' + femNoPriv.length + ' 人 ══');
for (const r of femNoPriv) console.log(`  ${r.d.padEnd(12)} ${(r.age || '—')}`);
