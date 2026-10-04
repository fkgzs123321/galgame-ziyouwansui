import fs from 'fs';
import path from 'path';
const root = 'src/兽血沸腾/世界书';
for (const d of fs.readdirSync(path.join(root, '角色'))) {
  const p = path.join(root, '角色', d, '性格调色盘.yaml');
  if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  console.log(`${d.padEnd(12)} L1=${lines[0].slice(0, 30)}`);
  console.log(`${''.padEnd(12)} L2=${(lines[1] || '').slice(0, 95)}`);
}
console.log('\n── 阶段指导/游戏主持总指导.yaml ──');
const g = fs.readFileSync(path.join(root, '阶段指导/游戏主持总指导.yaml'), 'utf8').split('\n');
console.log('  L1=' + g[0].slice(0, 90));
console.log('  L2=' + (g[1] || '').slice(0, 90));
console.log('\n── 时间线/当前剧情进度.yaml ──');
const t = fs.readFileSync(path.join(root, '时间线/当前剧情进度.yaml'), 'utf8').split('\n');
console.log('  L1=' + t[0].slice(0, 90));
console.log('  L2=' + (t[1] || '').slice(0, 90));
