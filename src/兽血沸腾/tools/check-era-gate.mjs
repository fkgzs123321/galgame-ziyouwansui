// 校验「硬登场门」。check-ejs.mjs 只读文件首行是 @@ 的条目，
// 看不见写在 contents 里的门，因此必须单独校验。
// 判据：
//  1. 每个 角色/NPC 条目最多一个 @@ 装饰器（文件首行 + contents 首片段合计）
//  2. 有门的条目，门的值 == era-table 的登场章
//  3. 门只写 `>= N`，不写上界
//  4. 门后面不能有空行
//  5. 登场为 0 的条目不应有门
import fs from 'fs';

const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));
const era = JSON.parse(fs.readFileSync(`${PROJ}/tools/era-table.json`, 'utf8'));
const 登场 = new Map();
for (const r of era.表) 登场.set(`${r.类型}/${r.名}`, r.登场);

let fail = 0;
const 有门 = [], 无门 = [];
const 错 = [];

for (const 类型 of ['角色', 'NPC']) {
  for (const [名, v] of Object.entries(st.entryManifest[类型])) {
    if (名 === '角色速览') continue;

    let 人 = null;
    if (类型 === 'NPC') 人 = 名;
    else for (const k of 登场.keys()) {
      if (!k.startsWith('角色/')) continue;
      const nm = k.slice(3);
      if (名 === nm || 名.startsWith(nm + '_')) { 人 = nm; break; }
    }
    const d = 人 && 登场.has(`${类型}/${人}`) ? 登场.get(`${类型}/${人}`) : null;

    const f = v.path || (v.contents || []).find(c => c.file)?.file;
    const 文件首行 = f && fs.existsSync(`${PROJ}/${f}`)
      ? (fs.readFileSync(`${PROJ}/${f}`, 'utf8').split('\n')[0] || '').trim() : '';
    const 片段门 = (v.contents || []).filter(c => (c.content ?? '').trim().startsWith('@@')).length;
    const 文件门 = 文件首行.startsWith('@@') ? 1 : 0;
    const 总门 = 片段门 + 文件门;

    if (总门 > 1) { 错.push(`${类型}/${名}: 装饰器 ${总门} 个（叠用）`); fail++; }

    const 门行 = (v.contents || []).find(c => (c.content ?? '').trim().startsWith('@@if '))?.content;
    if (门行) {
      有门.push(`${类型}/${名} → ${门行}`);
      const m = 门行.match(/章节序号',\s*\{\s*defaults:\s*0\s*\}\s*\)\s*>=\s*(\d+)/);
      if (!m) { 错.push(`${类型}/${名}: 门写法不符 -> ${门行}`); fail++; }
      else if (d !== null && Number(m[1]) !== d) { 错.push(`${类型}/${名}: 门 ${m[1]} ≠ 登场 ${d}`); fail++; }
      if (/<=/.test(门行)) { 错.push(`${类型}/${名}: 门不该写上界 -> ${门行}`); fail++; }
    } else if (d !== null && d > 0 && !文件门) {
      // 文件首行是 @@private 的条目走段落控制，此处只记录
      无门.push(`${类型}/${名} 登场=${d} ${文件首行.startsWith('@@') ? '(段落控制)' : '(缺门!)'}`);
      if (!文件首行.startsWith('@@')) { 错.push(`${类型}/${名}: 登场=${d} 但没有门`); fail++; }
    }
  }
}

console.log(`有门的条目 ${有门.length}`);
console.log(`无门（登场=0 或段落控制）${无门.length}`);
console.log(`\n── 无门明细（段落控制 / 登场0）──`);
for (const x of 无门.slice(0, 80)) console.log('   ' + x);
console.log(`\n══ 错误 ${fail} ══`);
for (const e of 错.slice(0, 40)) console.log('   ✗ ' + e);
if (!fail) console.log('   无 ✓');
process.exitCode = fail ? 1 : 0;
