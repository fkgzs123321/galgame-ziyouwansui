import fs from 'fs';
import path from 'path';

const NPC = 'src/兽血沸腾/世界书/NPC';
const CH = 'src/兽血沸腾/世界书/角色';

// 1. 有独立 角色/ 目录的人
const chDirs = fs.readdirSync(CH, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);

// 2. 群像成员
const groupMembers = new Map(); // 名 → 文件名
const groupFiles = [];
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml')).sort()) {
  const lines = fs.readFileSync(path.join(NPC, f), 'utf8').split('\n');
  let inM = false; const ms = [];
  for (const l of lines) {
    if (/^  成员:\s*$/.test(l)) { inM = true; continue; }
    if (inM) { const m = l.match(/^    ([^#\s][^:]*):\s*$/); if (m) ms.push(m[1]); }
  }
  if (ms.length > 1) { groupFiles.push({ f, ms }); ms.forEach(m => groupMembers.set(m, f)); }
}

// 3. 新写单人名文件
const NEW = ['贝克汉姆', '菲高', '贝肯鲍尔', '普斯卡什大师', '冬五', '古德', '维埃里', '贝拉米', '科里纳', '奥尼尔', '罗德曼'];

// 4. 角色速览索引
const cat = fs.readFileSync(path.join(CH, '角色速览.yaml'), 'utf8');
const catNames = [...cat.matchAll(/^- 姓名:\s*(.+)$/gm)].map(m => m[1].trim());

console.log(`角色/ 独立目录 ${chDirs.length} 个`);
console.log(`群像文件 ${groupFiles.length} 个，成员 ${groupMembers.size} 人`);
console.log(`角色速览 索引 ${catNames.length} 人`);

console.log('\n══ 11 个新文件 vs 既有覆盖 ══');
for (const n of NEW) {
  const inGroup = groupMembers.get(n);
  const inCh = chDirs.some(d => d === n) || chDirs.some(d => d.startsWith(n));
  const inCat = catNames.includes(n);
  console.log(`  ${n.padEnd(7)} 群像成员=${inGroup ? '是(' + inGroup + ')' : '否'}  角色专条=${inCh ? '是' : '否'}  速览索引=${inCat ? '是' : '否'}`);
}

console.log('\n══ 速览索引里、既无角色专条也无独立 NPC 文件的人（真缺口） ══');
const npcFiles = new Set(fs.readdirSync(NPC).filter(x => x.endsWith('.yaml')).map(x => x.replace(/\.yaml$/, '')));
for (const n of catNames) {
  const inCh = chDirs.some(d => d === n || d.startsWith(n));
  const inNpc = npcFiles.has(n);
  if (!inCh && !inNpc) console.log(`  ${n.padEnd(10)} 群像成员=${groupMembers.get(n) ?? '否'}`);
}

console.log('\n══ 群像成员里已有独立专条的人（须从群像块剥离，避免跨条目重复） ══');
for (const [m, f] of groupMembers) {
  const inCh = chDirs.some(d => d === m || d.startsWith(m));
  const inNew = NEW.includes(m);
  const inNpcSolo = npcFiles.has(m);
  if (inCh || inNew || inNpcSolo) console.log(`  ${m.padEnd(12)} 群像=${f.padEnd(24)} 角色专条=${inCh ? '是' : '否'} 新NPC=${inNew ? '是' : '否'} 单人名文件=${inNpcSolo ? '是' : '否'}`);
}
