// 核验：升格为「角色」的 8 人，其 NPC 专条是否已按裁定删除。
import fs from 'fs';

const 升格 = ['幽月儿', '加茜娅', '伦娜', '费雯丽', '朝河兰', '珍妮佛', '波姬小丝', '赫莲娜'];
const NPC = 'src/兽血沸腾/世界书/NPC';
const 角 = 'src/兽血沸腾/世界书/角色';

console.log('══ NPC 专条是否已删（应全为 False）══');
for (const n of 升格) {
  const p = `${NPC}/${n}.yaml`;
  console.log(`   ${n.padEnd(10)} NPC文件存在=${fs.existsSync(p)}`);
}

console.log('\n══ 角色目录是否齐备（每人应 4 件：基础信息/性格调色盘/私密/私密阶段）══');
const 需 = ['基础信息.yaml', '性格调色盘.yaml', '私密.yaml', '私密阶段.yaml'];
for (const n of 升格) {
  const d = `${角}/${n}`;
  if (!fs.existsSync(d)) { console.log(`   ✗ ${n} 目录不存在`); continue; }
  const 有 = fs.readdirSync(d);
  const 缺 = 需.filter(f => !有.includes(f));
  console.log(`   ${n.padEnd(10)} ${有.length} 件  ${缺.length ? '✗ 缺 ' + 缺.join('/') : '✓'}`);
}

console.log('\n══ NPC 目录总数 ══');
console.log(`   ${fs.readdirSync(NPC).filter(f => f.endsWith('.yaml')).length} 个`);
console.log('\n══ 角色目录总数（含 _速览 等）══');
const 角项 = fs.readdirSync(角);
console.log(`   ${角项.length} 项，其中目录 ${角项.filter(x => fs.statSync(`${角}/${x}`).isDirectory()).length} 个，文件 ${角项.filter(x => fs.statSync(`${角}/${x}`).isFile()).length} 个`);
