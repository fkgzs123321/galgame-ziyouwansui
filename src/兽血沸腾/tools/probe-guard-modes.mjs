// 只读：统计各类型条目的「守卫方式」，并找出「contents @@if + 文件自带 @@private」的组合。
import fs from 'fs';

const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));

const rows = [];
for (const [类型, M] of Object.entries(st.entryManifest)) {
  for (const [名, v] of Object.entries(M)) {
    let 方式 = '无';
    let 守卫 = '';
    let 文件 = null;
    if (v.contents) {
      文件 = (v.contents.find(c => c.file) || {}).file || null;
      const f0 = v.contents[0];
      if (f0 && f0.content && f0.content.startsWith('@@if')) { 方式 = 'contents@@if'; 守卫 = f0.content; }
      else 方式 = 'contents';
    } else if (v.path) { 方式 = 'path'; 文件 = v.path; }
    let 首行 = '';
    if (文件) {
      const p = `${PROJ}/${文件}`;
      if (fs.existsSync(p)) 首行 = (fs.readFileSync(p, 'utf8').split('\n')[0] || '').trim();
    }
    rows.push({ 类型, 名, 方式, 守卫, 文件, 首行 });
  }
}

console.log('══ 各类型守卫方式统计 ══');
const 汇总 = {};
for (const r of rows) {
  const k = `${r.类型}/${r.方式}`;
  汇总[k] = (汇总[k] || 0) + 1;
}
Object.entries(汇总).sort().forEach(([k, n]) => console.log(`   ${k.padEnd(28)} ${n}`));

console.log('\n══ 已用 contents@@if 守卫的条目 ══');
const g = rows.filter(r => r.方式 === 'contents@@if');
console.log(`   共 ${g.length} 个`);
for (const r of g) console.log(`   [${r.类型}] ${r.名.padEnd(20)} 文件首行「${r.首行}」`);

console.log('\n══ 危险组合：contents@@if + 文件首行是 @@ ══');
const 险 = g.filter(r => r.首行.startsWith('@@'));
console.log(`   ${险.length} 个` + (险.length ? '' : '（无）'));
for (const r of 险) console.log(`   ⚠ [${r.类型}] ${r.名}  首行「${r.首行}」`);

console.log('\n══ 文件首行是 @@ 的条目（全部）══');
const 自家 = rows.filter(r => r.首行.startsWith('@@'));
console.log(`   共 ${自家.length} 个，其注册方式分布：`);
const d = {};
for (const r of 自家) d[r.方式] = (d[r.方式] || 0) + 1;
Object.entries(d).forEach(([k, n]) => console.log(`      ${k} ${n}`));
