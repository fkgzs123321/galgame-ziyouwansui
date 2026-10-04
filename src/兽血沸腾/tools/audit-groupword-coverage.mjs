// 检查原群像的宽泛关键词，是否已被「世界观/地理/角色」等非 NPC 条目覆盖
import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const owned = {};   // key -> [条目]
for (const [type, items] of Object.entries(st.entryManifest)) {
  if (type === 'NPC') continue;
  for (const [k, v] of Object.entries(items)) {
    for (const key of new Set([...(v.keywords || []), ...(v.strategy?.keys || [])])) {
      (owned[key] ||= []).push(`${type}/${k}`);
    }
  }
}
const PROBE = ['人类王国', '教廷', '圣保罗', '帝国', '圣殿骑士', '龙族', '十万大山', '彩虹龙城', '仙女龙',
  '魔界', '魔族', '堕落天使', '唐藏', '云秦', '方士', '花衔', '配角', '过场', '次要人物', '采玉城', '卓尔',
  '宝塔', '冥界', '死亡领主', '亡灵', '花廷', '花精灵', '品级', '花将', '佛巨人', '恩特', '牧树人',
  '山丘之王', '灰矮人', '矮人', '慕兰', '沙漠', '骆驼', '飞驼', '绿洲', '阿訇', '海族', '人鱼王族',
  '军部', '比蒙王室', '技术人员', '翡冷翠文职'];
console.log('══ 宽泛词的非 NPC 覆盖 ══');
const orphan = [];
for (const p of PROBE) {
  const o = owned[p] || [];
  if (o.length === 0) orphan.push(p);
  console.log(`  ${o.length ? '✓' : '✗'} ${p} → ${o.length ? o.slice(0, 2).join(', ') + (o.length > 2 ? ` 等 ${o.length} 条` : '') : '（无）'}`);
}
console.log(`\n无任何非 NPC 条目承载的词 ${orphan.length}: ${orphan.join('、')}`);
