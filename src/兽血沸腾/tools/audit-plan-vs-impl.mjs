import fs from 'fs';
import YAML from 'yaml';

const plan = YAML.parse(fs.readFileSync('src/兽血沸腾/创作规划.yaml', 'utf8'));
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

// 创作规划里声明了 personality 的角色 → 应当有 _性格调色盘 条目
const declared = (plan.characters ?? []).filter(c => c.personality).map(c => c.name);
const declaredTri = (plan.characters ?? []).filter(c => c.tri_faceted === true).map(c => c.name);

const manifest = Object.keys(st.entryManifest['角色'] ?? {});
const hasPersonality = new Set();
const hasTri = new Set();
for (const k of manifest) {
  let m;
  if ((m = k.match(/^(.+)_性格调色盘$/))) hasPersonality.add(m[1]);
  if ((m = k.match(/^(.+)_三面性$/))) hasTri.add(m[1]);
}

console.log(`创作规划声明需写性格调色盘: ${declared.length} 人`);
console.log(`  实际有条目: ${declared.filter(n => hasPersonality.has(n)).length}`);
const missingP = declared.filter(n => !hasPersonality.has(n));
console.log(`  缺: ${missingP.length ? missingP.join('、') : '（无）'}`);

console.log(`\n创作规划标注 tri_faceted=true: ${declaredTri.length} 人 → ${declaredTri.join('、')}`);
const missingT = declaredTri.filter(n => !hasTri.has(n));
console.log(`  缺条目的: ${missingT.length ? missingT.join('、') : '（无）'}`);

// 反向：有条目但规划未声明的
const extraP = [...hasPersonality].filter(n => !declared.includes(n));
const extraT = [...hasTri].filter(n => !declaredTri.includes(n));
console.log(`\n有条目但规划未声明（可为超出规划的补充）:`);
console.log(`  性格调色盘: ${extraP.length ? extraP.join('、') : '（无）'}`);
console.log(`  三面性: ${extraT.length ? extraT.join('、') : '（无）'}`);

// 角色条目但既无 personality 也无 tri_faceted 的
const noExtra = manifest.map(k => k.match(/^(.+)_(基础信息)$/)?.[1]).filter(Boolean)
  .filter(n => !hasPersonality.has(n) && !hasTri.has(n));
console.log(`\n仅写基础信息的角色: ${noExtra.length} 人`);
console.log('  ' + noExtra.join('、'));
console.log(`\n其中创作规划声明过 personality 的: ${noExtra.filter(n => declared.includes(n)).join('、') || '（无）'}`);
