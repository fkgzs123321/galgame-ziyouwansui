import fs from 'fs';
import path from 'path';
const R = 'src/兽血沸腾/世界书/NPC';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const reg = st.entryManifest.NPC;

let tot = 0;
const rows = [];
for (const f of fs.readdirSync(R).filter(x => x.endsWith('.yaml')).sort()) {
  const lines = fs.readFileSync(path.join(R, f), 'utf8').split('\n');
  // 群像文件：2 空格缩进行首键（无冒号后内容）
  const members = [];
  let inMembers = false;
  lines.forEach((l, i) => {
    if (/^  成员:\s*$/.test(l)) { inMembers = true; return; }
    if (inMembers) { const m = l.match(/^    ([^#\s][^:]*):\s*$/); if (m) members.push(m[1]); }
  });
  const key = f.replace(/\.yaml$/, '');
  const e = reg[key];
  const keys = e?.strategy?.keys ?? [];
  const named = members.filter(m => keys.includes(m));
  const isGroup = members.length > 1;
  if (isGroup) { tot += members.length; rows.push({ f, n: members.length, hit: named.length, keys, members }); }
}
console.log('══ 群像文件（多成员） ══');
for (const r of rows.sort((a, b) => b.n - a.n)) {
  console.log(`${r.f.padEnd(26)} 成员 ${String(r.n).padStart(2)}  名入关键词 ${r.hit}  keys=[${r.keys.join(',')}]`);
  console.log(`   ${r.members.join('、')}`);
}
console.log(`\n群像文件 ${rows.length} 个，成员合计 ${tot} 人`);
const solo = fs.readdirSync(R).filter(x => x.endsWith('.yaml')).length - rows.length;
console.log(`单成员/新式文件 ${solo} 个`);
