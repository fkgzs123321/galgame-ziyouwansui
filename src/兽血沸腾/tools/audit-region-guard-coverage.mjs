// 区域守卫的正确核验方向。
//
// 84 个地理条目里 73 个无守卫（恒定可见），11 个带 @@if。
// 所以「区域值没被守卫覆盖」不是缺陷 —— 无守卫条目恒定渲染。
// 真正的风险是反向的：某个守卫把所有相关条目都关掉，玩家在某开局点看不到任何地理设定。
//
// 本脚本核验：每个开局区域值，至少能点亮多少条带守卫的条目。
import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const 地 = st.entryManifest.地理;
const 键 = Object.keys(地);

const 卫 = [];
for (const k of 键) {
  const s = JSON.stringify(地[k]);
  if (!s.includes('@@if')) continue;
  const m = s.match(/@@if[^"\\]{0,400}/);
  if (m) 卫.push([k, m[0]]);
}
const 无卫 = 键.length - 卫.length;

// 开局会写入的区域值
const 值 = ['荒岛', '胸罩岛', '西雅海域', '多瑙大荒原', '翡冷翠', '桑干河前线', '爱琴大陆'];

console.log(`══ 地理条目 ${键.length} 个：带守卫 ${卫.length} / 无守卫 ${无卫} ══`);
console.log(`无守卫条目恒定渲染 ⇒ 不论在哪个区域，玩家至少有 ${无卫} 条地理设定可见。\n`);

console.log('── 每个开局区域值额外点亮多少条带守卫的条目 ──');
for (const v of 值) {
  const 亮 = 卫.filter(([, c]) => c.includes(`'${v}'`)).map(([k]) => k);
  console.log(`   ${v.padEnd(12)} +${String(亮.length).padStart(2)} 条  ${亮.join(' · ')}`);
}

// 反向：有没有守卫词匹配不到任何开局值（可能永远不亮）
console.log('\n── 守卫词与开局值的匹配检查 ──');
for (const [k, c] of 卫) {
  const 词 = [...c.matchAll(/includes\('([^']+)'\)/g)].map(m => m[1]);
  const 独有 = 词.filter(w => !值.some(v => v.includes(w) || w.includes(v)));
  const 标 = 独有.length === 词.length ? '⚠ 全部守卫词都不是开局值' : '';
  console.log(`   ${k.padEnd(14)} ${词.join('|')}  ${标}`);
}
