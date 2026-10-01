// 校验打包产物里全部 私密档案 / 私密阶段 条目的形状与首行。
// 形状铁律：XML 包裹条目（私密档案）第 1 行必须是 ---，第 2 行必须是 <character_other ...>，末行 </character_other>；
//           EJS 条目（私密阶段）第 1 行必须是 @@private，且正文中不得出现 XML 标签。
import fs from 'fs';

const card = JSON.parse(fs.readFileSync('src/兽血沸腾/兽血沸腾.json', 'utf8'));
const book = card.data.character_book;

const 档案 = [];
const 阶段 = [];
for (const e of book.entries) {
  const nm = (e.comment || '').replace(/\[.*?\]/g, '').trim();
  if (nm.endsWith('_私密档案')) 档案.push([nm, e]);
  if (nm.endsWith('_私密阶段')) 阶段.push([nm, e]);
}

let bad = 0;
const check = (list, isXml, label) => {
  console.log(`\n════ ${label}（${list.length} 条）════`);
  for (const [nm, e] of list) {
    const c = e.content || '';
    const L = c.split('\n');
    const first = L[0].trim();
    const second = (L[1] || '').trim();
    const last = L[L.length - 1].trim();
    const errs = [];
    if (isXml) {
      if (first !== '---') errs.push(`首行应为 --- 实为「${first.slice(0, 30)}」`);
      if (!second.startsWith('<character_other')) errs.push(`第2行缺 XML 开标签`);
      if (last !== '</character_other>') errs.push(`末行应为 </character_other> 实为「${last.slice(0, 30)}」`);
      const named = second.match(/character="([^"]+)"/);
      const who = nm.replace('_私密档案', '');
      if (named && named[1] !== who) errs.push(`XML character 属性 ${named[1]} ≠ ${who}`);
      if (c.includes('@@')) errs.push(`XML 条目里出现 @@ 装饰器`);
    } else {
      if (first !== '@@private') errs.push(`首行应为 @@private 实为「${first.slice(0, 30)}」`);
      if (/<character_/.test(c)) errs.push(`EJS 条目里出现 XML 标签`);
      if (c.split('\n').filter(l => l.trimStart().startsWith('@@')).length !== 1) errs.push(`@@ 出现次数 ≠ 1`);
    }
    const kb = (Buffer.byteLength(c, 'utf8') / 1024).toFixed(1);
    if (errs.length) { bad++; console.log(`  ✗ ${nm.padEnd(18)} ${kb}KB  ${errs.join('; ')}`); }
    else console.log(`  ✓ ${nm.padEnd(18)} ${kb}KB  ${L.length}行  constant=${e.constant} keys=${JSON.stringify(e.keyes || e.keys || [])}`);
  }
};
check(档案, true, '私密档案（XML 静态）');
check(阶段, false, '私密阶段（EJS 动态）');

console.log(`\n世界书条目总数: ${book.entries.length}`);
console.log(`character_other 条目: ${book.entries.filter(e => (e.content || '').includes('<character_other')).length}`);
const totalKb = [...档案, ...阶段].reduce((a, [, e]) => a + Buffer.byteLength(e.content, 'utf8'), 0) / 1024;
console.log(`私密条目合计: ${totalKb.toFixed(1)} KB / ${档案.length + 阶段.length} 条`);
console.log(bad ? `\n✗ ${bad} 条形状不合规` : '\n✓ 全部形状合规');
process.exit(bad ? 1 : 0);
