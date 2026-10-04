// 查看 7 个待修 NPC 文件的当前状态（前向剧透是否已清除）与修改时间。
import fs from 'fs';
import path from 'path';

const 单 = [
  ['NPC/罗德曼.yaml', ['山丘之王']],
  ['NPC/古德.yaml', ['翡冷翠']],
  ['NPC/齐丹大萨满.yaml', ['翡冷翠']],
  ['NPC/迦莎.yaml', ['太保团']],
  ['NPC/道根.yaml', ['翡冷翠']],
  ['NPC/贝拉米.yaml', ['翡冷翠']],
  ['NPC/赞迪.yaml', ['航空兵']],
];

const ROOT = 'src/兽血沸腾/世界书';
for (const [f, 词] of 单) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) { console.log(`✗ 缺 ${f}`); continue; }
  const t = fs.readFileSync(p, 'utf8');
  const st = fs.statSync(p);
  const 剩 = 词.map(w => `${w}×${t.split(w).length - 1}`).join(' ');
  console.log(`${f.padEnd(24)} ${st.mtime.toISOString().slice(0, 19)}  ${剩}`);
}
