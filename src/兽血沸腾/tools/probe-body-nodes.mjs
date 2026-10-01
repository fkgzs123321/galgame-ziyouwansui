// 核验：SkillTreePanel 里硬编码的异体原节点是否真的在 schema / initvar / 变量更新规则里存在。
// 若只在面板里写、变量树里没有，玩家会看到点不动的死节点。
import fs from 'fs';

const 需 = ['龙力系', '花系', '金刚伏魔之力', '秘银断臂'];

const schema = fs.readFileSync('src/兽血沸腾/schema.ts', 'utf8');
const initvar = fs.readFileSync('src/兽血沸腾/世界书/变量/initvar.yaml', 'utf8');
const 规则 = fs.readFileSync('src/兽血沸腾/世界书/变量/变量更新规则.yaml', 'utf8');

console.log('节点'.padEnd(16) + 'schema.ts'.padStart(10) + 'initvar'.padStart(9) + '更新规则'.padStart(10));
console.log('─'.repeat(46));
for (const n of 需) {
  const a = schema.includes(n) ? 'Y' : '✗';
  const b = initvar.includes(n) ? 'Y' : '✗';
  const c = 规则.includes(n) ? 'Y' : '✗';
  console.log(n.padEnd(16) + a.padStart(10) + b.padStart(9) + c.padStart(10));
}

// 异体原 在 schema 里的定义
console.log('\n── schema.ts 里 异体原 的定义 ──');
schema.split('\n').forEach((l, i) => { if (l.includes('异体原')) console.log(`   L${i + 1}: ${l.trim()}`); });

// initvar 里的异体原段
console.log('\n── initvar.yaml 里 异体原 段 ──');
const L = initvar.split('\n');
const k = L.findIndex(l => l.includes('异体原'));
if (k >= 0) for (let i = k; i < Math.min(k + 14, L.length); i++) console.log(`   ${L[i]}`);
