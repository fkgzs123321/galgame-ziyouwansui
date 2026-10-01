// 决定性问题：已经用 contents 首片段 @@if 开门的条目（Shape A 基础信息 / Shape C 地理），
// 其内容文件内部还能不能用 <%_ %> 分支？一个条目只能有一个装饰器（ejs/guide.md L162），
// 所以这些文件不能再加 @@private。若内部 <%_ %> 可行，桶一就能就地分档。
import fs from 'fs';
import path from 'path';

const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));

const 有外门有内联 = [];
const 有外门无内联 = [];
const 无门有内联 = [];
let 外门数 = 0;

for (const [类型, m] of Object.entries(st.entryManifest)) {
  for (const [名, v] of Object.entries(m)) {
    const 有门 = Array.isArray(v.contents) && v.contents[0]?.content?.trim().startsWith('@@if ');
    if (有门) 外门数++;
    const files = [];
    if (v.path) files.push(v.path);
    for (const c of v.contents ?? []) if (c.file) files.push(c.file);
    for (const f of files) {
      const p = `${PROJ}/${f}`;
      if (!fs.existsSync(p)) continue;
      const t = fs.readFileSync(p, 'utf8');
      const 有内联 = /<%_\s*(if|else|const|for)\b/.test(t);
      if (有门 && 有内联) 有外门有内联.push(`${类型}/${名} → ${f}`);
      if (有门 && !有内联) 有外门无内联.push(`${类型}/${名} → ${f}`);
      if (!有门 && 有内联) 无门有内联.push(`${类型}/${名} → ${f}`);
    }
  }
}

console.log(`contents 开门的条目: ${外门数}`);
console.log(`\n══ 有外门 且 文件内含 <%_ %> 分支（★决定性证据）══`);
console.log(有外门有内联.length ? 有外门有内联.join('\n') : '（无）');
console.log(`\n══ 有外门 但 文件内无 <%_ %>（本次新加门的绝大多数在此）: ${有外门无内联.length} ══`);
for (const x of 有外门无内联.slice(0, 25)) console.log('   ' + x);
console.log(`\n══ 无外门 但有 <%_ %>: ${无门有内联.length} ══`);
for (const x of 无门有内联.slice(0, 10)) console.log('   ' + x);
