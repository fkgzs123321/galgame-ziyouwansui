// 只读：清点 角色/NPC 条目的真实基数，找出纪元表遗漏。
import fs from 'fs';
import path from 'path';

const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));

const 角色M = st.entryManifest.角色 || {};
const NPCM = st.entryManifest.NPC || {};
console.log(`state 角色条目 ${Object.keys(角色M).length}  NPC 条目 ${Object.keys(NPCM).length}`);

// 角色条目 → 依赖的磁盘文件 → 归属目录
const 目录 = new Set();
for (const [k, v] of Object.entries(角色M)) {
  const ps = [];
  if (v.path) ps.push(v.path);
  for (const c of v.contents || []) if (c.file) ps.push(c.file);
  for (const p of ps) {
    const m = String(p).match(/^世界书\/角色\/([^/]+)\//);
    if (m) 目录.add(m[1]);
    else if (String(p).includes('角色速览')) 目录.add('（速览/索引）');
    else 目录.add('（其他）:' + p);
  }
}
console.log(`\n角色条目归属目录 ${目录.size} 个`);
const 非目录 = [...目录].filter(d => d.startsWith('（'));
console.log(`  非目录项: ${非目录.join(' / ') || '无'}`);

// 磁盘上的角色子目录
const DIR = `${PROJ}/世界书/角色`;
const 磁盘目录 = fs.readdirSync(DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
const 磁盘文件 = fs.readdirSync(DIR).filter(f => f.endsWith('.yaml'));
console.log(`\n磁盘角色子目录 ${磁盘目录.length} 个`);
console.log(`磁盘角色根 .yaml ${磁盘文件.length} 个：${磁盘文件.join('、')}`);

// 有 基础信息.yaml 的目录
let 有基础 = 0; const 无基础 = [];
for (const d of 磁盘目录) if (fs.existsSync(path.join(DIR, d, '基础信息.yaml'))) 有基础++; else 无基础.push(d);
console.log(`\n有 基础信息.yaml 的目录 ${有基础} / ${磁盘目录.length}`);
console.log(`无 基础信息.yaml 的目录 ${无基础.length} 个：${无基础.join('、')}`);

// 各目录里的文件种类
const 种类 = new Map();
for (const d of 磁盘目录) for (const f of fs.readdirSync(path.join(DIR, d))) 种类.set(f, (种类.get(f) || 0) + 1);
console.log('\n目录内文件种类：');
[...种类.entries()].sort((a, b) => b[1] - a[1]).forEach(([f, n]) => console.log(`   ${String(n).padStart(3)}  ${f}`));

// 纪元表覆盖差集
const era = JSON.parse(fs.readFileSync(`${PROJ}/tools/era-table.json`, 'utf8'));
const 已 = new Set(era.表.map(x => x.类型 + '/' + x.名));
const 漏角色 = 磁盘目录.filter(d => !已.has('角色/' + d));
const 漏NPC = Object.keys(NPCM).filter(n => !已.has('NPC/' + n));
console.log(`\n纪元表已覆盖 ${已.size}`);
console.log(`漏掉的角色目录 ${漏角色.length}：${漏角色.join('、')}`);
console.log(`漏掉的 NPC ${漏NPC.length}：${漏NPC.slice(0, 40).join('、')}`);
