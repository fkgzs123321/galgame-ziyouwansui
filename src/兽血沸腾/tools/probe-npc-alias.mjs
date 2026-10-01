import fs from 'fs';
import path from 'path';
const CH = 'src/兽血沸腾/世界书/角色';
const chDirs = fs.readdirSync(CH, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');

// 群像成员名 vs 已有角色目录名：在原文中同现即疑为同一人
const SUSPECT = ['青雅', '安度兰', '海华丝', '唐蓓尔金娜', '克鲁伊夫', '德塞利', '姬丝凯碧', '兰帕德', '耐温尔因克', '玉皇', '明姚', '基恩', '青雅.白玉'];
console.log('已有角色目录:', chDirs.join('、'), '\n');

for (const n of SUSPECT) {
  const key = n.replace(/\..*$/, '');
  const alias = chDirs.filter(d => d === key);
  if (!alias.length) continue;
  console.log(`══ ${n} — 目录「${alias[0]}」存在 ══`);
  const h = [];
  lines.forEach((l, i) => { if (l.includes(n)) h.push(i + 1); });
  for (const i of h.slice(0, 2)) console.log(`  L${i}: ${lines[i - 1].trim().slice(0, 160)}`);
  console.log();
}

// 专项：青雅 ↔ 白素青
console.log('══ 青雅 ↔ 白素青 同一性验证 ══');
for (const n of ['青雅·白玉', '青雅.白玉', '白素青']) {
  const h = [];
  lines.forEach((l, i) => { if (l.includes(n)) h.push(i + 1); });
  console.log(`  ${n}: ${h.length} 行  ${h.slice(0, 4).join(', ')}`);
}
