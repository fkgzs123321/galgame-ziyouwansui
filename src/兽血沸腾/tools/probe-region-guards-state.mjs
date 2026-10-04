// 区域守卫真正的位置：state 的 entryManifest.地理.*
import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const 地 = st.entryManifest.地理;
const 键 = Object.keys(地);
console.log(`══ 地理条目 ${键.length} 个 ══`);
console.log('键样例：' + 键.slice(0, 6).join(' · '));

const 全 = JSON.stringify(地);
console.log(`\n含 @@if 的条目：${(全.match(/@@if/g) ?? []).length} 处`);

const 卫 = [];
for (const k of 键) {
  const s = JSON.stringify(地[k]);
  if (!s.includes('@@if')) continue;
  const m = s.match(/@@if[^"\\]{0,140}/g) ?? [];
  const 去 = [...new Set(m)];
  卫.push([k, 去]);
}
console.log(`带守卫的条目：${卫.length} / ${键.length}\n`);
for (const [k, cs] of 卫) {
  console.log(`   ${k}`);
  for (const c of cs.slice(0, 2)) console.log(`        ${c}`);
}
