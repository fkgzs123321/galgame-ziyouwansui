import fs from 'fs';
import path from 'path';
const R = 'src/兽血沸腾/世界书/NPC';
const NAMES = ['贝克汉姆', '小贝', '菲高', '贝肯鲍尔', '普斯卡什', '冬五', '唐藏亲王',
  '古德', '潘帅', '维埃里', '贝拉米', '科里纳', '奥尼尔', '罗德曼'];

for (const f of fs.readdirSync(R).filter(x => x.endsWith('.yaml')).sort()) {
  const p = path.join(R, f);
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  // 顶层成员键：2 空格缩进
  const members = [];
  lines.forEach((l, i) => { const m = l.match(/^  ([^#\s][^:]*):\s*$/); if (m) members.push({ i, k: m[1] }); });
  const hits = NAMES.filter(n => lines.some(l => l.includes(n)));
  if (!hits.length) continue;
  console.log(`\n══ ${f}  (${lines.length} 行, 成员 ${members.length}) ══`);
  console.log(`   提到: ${hits.join('、')}`);
  console.log(`   成员键: ${members.map(m => m.k).join(' | ')}`);
  console.log(`   首行: ${lines[0]}`);
}
