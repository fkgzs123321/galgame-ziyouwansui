// 只读：为每个开局时点，算出各角色「是否已登场 / 条目里是否已写成终局关系」。
import fs from 'fs';
import path from 'path';

const TXT = 'src/兽血沸腾/兽血沸腾.txt';
const 行 = fs.readFileSync(TXT, 'utf8').split('\n');
const 头 = [];
行.forEach((l, i) => { if (/^第[一二三四五六七八九十百千零〇\d]+章\s/.test(l.trim())) 头.push(i); });
const 章 = ln => { let c = 0; for (const h of 头) { if (h <= ln) c++; else break; } return c - 1; };

// 首次登场章
const 登场 = {};
const 记 = (名, 别名 = []) => {
  let best = -1;
  for (const c of [名, ...别名]) {
    if (c.length < 2) continue;
    const i = 行.findIndex(l => l.includes(c));
    if (i >= 0 && (best < 0 || i < best)) best = i;
  }
  if (best >= 0) 登场[名] = 章(best);
};
const 角色 = 'src/兽血沸腾/世界书/角色';
const 名册 = fs.readdirSync(角色, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
for (const n of 名册) 记(n);

// 终局词
const 终局词 = ['妻子', '夫人', '丈夫', '领主夫人', '后宫', '育有', '爱人与妻子', '第一任院长', '教女'];
const 终局 = {};
for (const n of 名册) {
  const p = path.join(角色, n, '基础信息.yaml');
  const 调 = path.join(角色, n, '性格调色盘.yaml');
  let t = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  if (fs.existsSync(调)) t += fs.readFileSync(调, 'utf8');
  终局[n] = 终局词.filter(w => t.includes(w));
}

const 开局 = { '荒岛篇(0)': 0, '海上篇(27)': 27, '多瑙大荒原篇(31)': 31, '领主期(245)': 245, '决战(747)': 747 };

console.log('开局时点 × 角色：● 已登场  ○ 未登场   ⚠ 有终局表述\n');
const 列 = Object.keys(开局);
console.log('角色'.padEnd(14) + '登场'.padStart(5) + '  ' + 列.map(x => x.padEnd(16)).join(''));
for (const n of 名册.sort((a, b) => (登场[a] ?? 9999) - (登场[b] ?? 9999))) {
  const d = 登场[n] ?? -1;
  if (终局[n].length === 0) continue;   // 只看有终局表述的
  const 格 = 列.map(k => {
    const t = 开局[k];
    const 登 = d >= 0 && d <= t ? '●' : '○';
    return (登 + (d >= 0 && d > t ? ' ⚠' : '')).padEnd(16);
  });
  console.log(n.padEnd(14) + String(d).padStart(5) + '  ' + 格.join(''));
}

console.log('\n══ 有终局表述且在荒岛篇(0)尚未登场的角色 ══');
const 早 = 名册.filter(n => 终局[n].length && (登场[n] ?? 9999) > 0);
console.log('   ' + 早.join('、'));
console.log(`   共 ${早.length} 人`);
