// 复核 audit-npc-forward-leak 报的 9 行：是真剧透，还是「锚点词属于另一个人/另一个时期」。
import fs from 'fs';
import path from 'path';

const 行 = [
  ['永贝里', 105, 234, '采玉城'],
  ['罗德曼', 121, 199, '山丘之王'],
  ['古德', 25, 72, '翡冷翠'],
  ['齐丹大萨满', 50, 72, '翡冷翠'],
  ['迦莎', 476, 494, '太保团'],
  ['道根', 57, 72, '翡冷翠'],
  ['贝拉米', 59, 72, '翡冷翠'],
  ['赞迪', 338, 346, '航空兵'],
  ['罗森博格', 71, 72, '翡冷翠'],
];

for (const [名, 首, 锚, 词] of 行) {
  const f = `src/兽血沸腾/世界书/NPC/${名}.yaml`;
  if (!fs.existsSync(f)) { console.log(`【${名}】缺文件`); continue; }
  const t = fs.readFileSync(f, 'utf8').split('\n');
  const hit = t.map((l, i) => [i + 1, l]).filter(([, l]) => l.includes(词));
  console.log(`\n【${名}】首登场 ${首} · 锚点 ${锚} · 词「${词}」  命中 ${hit.length} 行`);
  for (const [i, l] of hit) console.log(`   L${i}: ${l.trim().slice(0, 118)}`);
}
