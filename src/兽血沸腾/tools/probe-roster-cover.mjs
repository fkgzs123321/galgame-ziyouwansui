// 角色速览.yaml 里列的人，哪些有独立条目、哪些没有。
// 速览要按纪元分档，就得知道每个人的身份文字能从哪个条目推导出来。
import fs from 'node:fs';
import path from 'node:path';

const 速览 = fs.readFileSync('src/兽血沸腾/世界书/角色/角色速览.yaml', 'utf8');
const 名录 = [...速览.matchAll(/^\s*- 姓名:\s*(.+?)\s*$/gm)].map(m => m[1]);
const 角色根 = 'src/兽血沸腾/世界书/角色';
const NPC根 = 'src/兽血沸腾/世界书/NPC';
const 有目录 = new Set(fs.readdirSync(角色根, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name));
const NPC文件 = fs.existsSync(NPC根) ? fs.readdirSync(NPC根).map(f => f.replace(/\.yaml$/, '')) : [];
const era = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-table.json', 'utf8'));
const 登场 = new Map(era.表.map(r => [r.名, r.登场]));

const 有 = [], 无 = [];
for (const 名 of 名录) {
  const 有角色 = 有目录.has(名);
  const 有NPC = NPC文件.includes(名);
  const 行 = `${名}  登场=${登场.get(名) ?? '?'}`;
  if (有角色) 有.push(行 + '  [角色]');
  else if (有NPC) 有.push(行 + '  [NPC]');
  else 无.push(行);
}

const out = [
  `速览名录 ${名录.length} 人：有专条 ${有.length}，无专条 ${无.length}`,
  '',
  '── 无专条（身份文字只能从速览自身或阵营速查里来）──',
  ...无.map(x => '  ' + x),
  '',
  '── 有专条 ──',
  ...有.map(x => '  ' + x),
];
fs.writeFileSync('src/兽血沸腾/tools/_速览覆盖.txt', out.join('\n'), 'utf8');
console.log(`名录 ${名录.length}：有专条 ${有.length} / 无专条 ${无.length}`);
