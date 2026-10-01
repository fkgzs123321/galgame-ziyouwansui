// 校验 28 个「由既有专条承载」的成员，其名字是否已在既有条目的 keywords 中
import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const allKeys = new Set();
for (const [type, items] of Object.entries(st.entryManifest)) {
  for (const v of Object.values(items)) {
    (v.keywords || []).forEach(k => allKeys.add(k));
    (v.strategy?.keys || []).forEach(k => allKeys.add(k));
  }
}
const DELEGATED = ['普斯卡什', '兰帕德', '德塞利', '姬丝凯碧', '克鲁伊夫', '唐蓓尔金娜', '茜茜', '海华丝',
  '耐温尔因克', '贞德', '茉儿', '唐藏亲王', '小空', '福格森.徐', '凝玉', '麝人阿杜', '死神印记', '口水怪',
  '潘帅', '玉皇', '嘉宝', '阿仙奴', '奥尼尔', '贝肯鲍尔', '菲高', '贝克汉姆', '古德', '贝拉米', '维埃里',
  '科里纳', '罗德曼', '白素青', '青雅'];
const miss = [];
for (const n of DELEGATED) {
  const cands = [n, n.split(/[.·]/)[0], n.replace(/^(麝人|死神印记|口水怪)$/, n)];
  if (!cands.some(c => allKeys.has(c))) miss.push(n);
}
console.log(`既有条目关键词总数 ${allKeys.size}`);
console.log(`已覆盖 ${DELEGATED.length - miss.length} / ${DELEGATED.length}`);
if (miss.length) console.log('未覆盖: ' + miss.join('、'));
// 打印含「贞德」「谭雅」的条目关键词，确认
for (const probe of ['贞德', '谭雅', '白素青', '嘉宝', '阿仙奴']) {
  const hits = [];
  for (const [type, items] of Object.entries(st.entryManifest))
    for (const [k, v] of Object.entries(items))
      if ((v.keywords || []).includes(probe)) hits.push(`${type}/${k}`);
  console.log(`  「${probe}」→ ${hits.length ? hits.join(', ') : '（无）'}`);
}
