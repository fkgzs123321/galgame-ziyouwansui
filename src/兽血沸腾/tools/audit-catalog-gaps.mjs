// 重新审计「只在速览里、无独立条目」的人：必须同时查 NPC/ 与 角色/ 两处。
import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书';
const CAT = path.join(ROOT, '角色/角色速览.yaml');

// 速览里的全部姓名
const cat = fs.readFileSync(CAT, 'utf8').split('\n');
const names = [];
for (const l of cat) {
  const m = l.match(/^\s*-\s*姓名:\s*(.+?)\s*$/);
  if (m) names.push(m[1]);
}
console.log(`速览人数 ${names.length}\n`);

// 收集所有独立条目承载的姓名
const roleDirs = new Set(fs.readdirSync(path.join(ROOT, '角色'), { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name));
const npcFiles = new Set(fs.readdirSync(path.join(ROOT, 'NPC'))
  .filter(f => f.endsWith('.yaml')).map(f => f.replace(/\.yaml$/, '')));

// NPC 群像文件正文里提到的姓名也算「被写到」
const npcText = [...npcFiles].map(f => fs.readFileSync(path.join(ROOT, 'NPC', f + '.yaml'), 'utf8')).join('\n');
const roleDirsText = {};
for (const d of roleDirs) {
  roleDirsText[d] = fs.readdirSync(path.join(ROOT, '角色', d))
    .map(f => fs.readFileSync(path.join(ROOT, '角色', d, f), 'utf8')).join('\n');
}

console.log('速览姓名'.padEnd(22) + '角色/独立目录'.padEnd(16) + 'NPC单独'.padEnd(10) + 'NPC群像提及');
console.log('─'.repeat(76));
const gaps = [];
for (const n of names) {
  // 速览里的姓名可能带括号说明，取主名
  const main = n.replace(/（.*?）|\(.*?\)/g, '').trim();
  const inRoleDir = roleDirs.has(main) || [...roleDirs].some(d => d === main);
  const inNpcFile = npcFiles.has(main);
  const inNpcText = npcText.includes(main);
  // 也被角色速览以外的角色目录正文提及
  const inRoleText = Object.entries(roleDirsText).some(([d, t]) => d !== '角色速览' && t.includes(main));
  const tag = [];
  if (inRoleDir) tag.push('✓');
  if (inNpcFile) tag.push('✓');
  if (inNpcText) tag.push('提及');
  if (inRoleText) tag.push('角色正文提及');
  if (!inRoleDir && !inNpcFile) gaps.push({ n: main, inNpcText, inRoleText });
  console.log(`${main.padEnd(22)}${(inRoleDir ? '✓' : '·').padEnd(16)}${(inNpcFile ? '✓' : '·').padEnd(10)}${inNpcText ? '提及' : '·'}${inRoleText ? ' ／角色正文提及' : ''}`);
}
console.log(`\n══ 真正缺独立条目的：${gaps.length} 人 ══`);
for (const g of gaps) console.log(`   ${g.n.padEnd(20)} NPC群像${g.inNpcText ? '有' : '无'}  角色正文${g.inRoleText ? '有' : '无'}`);
