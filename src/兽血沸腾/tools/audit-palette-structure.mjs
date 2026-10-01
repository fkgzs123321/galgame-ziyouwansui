import fs from 'fs';
import path from 'path';

const DIR = 'src/兽血沸腾/世界书/角色';
const names = fs.readdirSync(DIR).filter(d => fs.existsSync(path.join(DIR, d, '性格调色盘.yaml')));

console.log('角色'.padEnd(14) + '大小    行  首行  「对角色的理解与思考」  「总结」');
for (const n of names) {
  const p = path.join(DIR, n, '性格调色盘.yaml');
  const c = fs.readFileSync(p, 'utf8');
  const lines = c.split('\n');
  const hasThink = /对角色的理解与思考/.test(c);
  const hasSum = /^总结:/m.test(c);
  console.log(`  ${n.padEnd(12)} ${String(fs.statSync(p).size).padStart(6)}B ${String(lines.length).padStart(3)}  ${lines[0].slice(0, 10).padEnd(10)}  ${hasThink ? '有' : '<<< 无'}              ${hasSum ? '有' : '无'}`);
}

console.log('\n══ 已注册的 _二次解释 条目 ══');
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
for (const [n, l] of Object.entries(st.entryManifest['角色'])) {
  if (l.rephrase) console.log(`  ${n}  path=${l.path ?? '(contents)'}  order=${l.position?.order}`);
}
