// 只读：阶段指导/事件的注册形状、check-yaml 的 EJS 跳过逻辑、各开局的关系阶段值。
import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

console.log('══ 阶段指导 注册 ══');
for (const [k, v] of Object.entries(st.entryManifest.阶段指导)) {
  console.log('  ' + k);
  console.log('    ' + JSON.stringify({ ...v, contents: v.contents ? '[…]' : undefined }));
}
console.log('\n══ 阶段指导 depth_defaults ══');
console.log('  ' + JSON.stringify(st.depth_defaults));

console.log('\n══ 事件 样例形状 ══');
const e = Object.entries(st.entryManifest.事件)[0];
console.log('  ' + e[0]);
console.log('    ' + JSON.stringify({ ...e[1], path: e[1].path }));

console.log('\n══ check-yaml.mjs 的 EJS/跳过逻辑 ══');
const c = fs.readFileSync('src/兽血沸腾/tools/check-yaml.mjs', 'utf8').split('\n');
c.forEach((l, i) => { if (/skipEJS|EJS|@@|<%|skip/i.test(l)) console.log(`  ${i + 1}: ${l.trim()}`); });

console.log('\n══ 各开局 initvar 的关系/章节锚点 ══');
for (const f of fs.readdirSync('src/兽血沸腾/开场白/initvar').sort()) {
  const t = fs.readFileSync('src/兽血沸腾/开场白/initvar/' + f, 'utf8');
  const 章 = (t.match(/章节序号:\s*(\d+)/) || [])[1];
  const 卷 = (t.match(/当前卷:\s*(.*)/) || [])[1];
  const 阶段 = [...t.matchAll(/关系阶段:\s*([^\n,}]+)/g)].map(x => x[1].trim());
  const 名 = [...t.matchAll(/^(\s+)关系:\s*$/gm)];
  console.log(`  ${f}  章=${章}  卷=${(卷 || '').trim()}`);
  console.log(`     关系阶段 (${阶段.length}): ${阶段.length ? [...new Set(阶段)].join('、') : '无'}`);
  console.log(`     关系键数: ${new Set([...t.matchAll(/^\s{4}([\u4e00-\u9fa5.\u00b7]{2,10}):\s*$/gm)].map(x => x[1])).size}`);
}
