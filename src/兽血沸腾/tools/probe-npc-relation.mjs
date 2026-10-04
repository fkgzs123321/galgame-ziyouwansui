import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
// 采样「与主角的关系」字段，判断剧透严重度
const want = ['海族与人鱼王族.yaml', '魔界与侵略者.yaml', '花廷品级成员与花精灵.yaml', '山丘之王与灰矮人.yaml', '星界与梦界.yaml'];
for (const f of want) {
  const lines = fs.readFileSync(path.join(NPC, f), 'utf8').split('\n');
  console.log(`\n══ ${f} ══`);
  let cur = null, cap = false;
  for (const l of lines) {
    const m = l.match(/^    ([^#\s][^:]*):\s*$/);
    if (m) { cur = m[1]; cap = false; continue; }
    if (/^\s{6}与主角的关系:/.test(l)) { cap = true; console.log(`  ${cur}: ${l.trim().replace(/^与主角的关系:\s*/, '')}`); continue; }
    if (cap && /^\s{8}\S/.test(l)) console.log(`      ${l.trim()}`);
    else if (cap && /^\s{6}\S/.test(l)) cap = false;
  }
}
