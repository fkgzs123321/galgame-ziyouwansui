// 检查 28 个「由既有专条承载」的成员名，是否已在既有条目关键词中；缺的生成别名补丁
import fs from 'fs';
const ST = 'src/兽血沸腾/tavern-cards-state.json';
const st = JSON.parse(fs.readFileSync(ST, 'utf8'));
const patch = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/patch-npc.json', 'utf8'));

// 现状关键词（含补丁新增）
const byKey = {};
for (const [type, items] of Object.entries(st.entryManifest))
  for (const [k, v] of Object.entries(items)) {
    for (const key of new Set([...(v.keywords || []), ...(v.strategy?.keys || [])])) (byKey[key] ||= []).push({ type, k });
  }
for (const op of patch) {
  if (op.op !== 'add') continue;
  const [, type, k] = op.path.split('/');
  for (const key of op.value.keywords || []) (byKey[key] ||= []).push({ type, k });
}

const DELEGATED = ['普斯卡什', '兰帕德', '德塞利', '姬丝凯碧', '克鲁伊夫', '唐蓓尔金娜', '茜茜', '海华丝',
  '耐温尔因克', '贞德', '茉儿', '小空', '福格森.徐', '凝玉', '玉皇', '嘉宝', '阿仙奴', '青雅'];
const miss = [];
for (const n of DELEGATED) {
  const hits = byKey[n] || [];
  if (hits.length === 0) miss.push(n);
  console.log(`  ${hits.length ? '✓' : '✗'} ${n} → ${hits.length ? hits.slice(0, 2).map(h => `${h.type}/${h.k}`).join(', ') : '（无）'}`);
}
console.log(`\n缺关键词 ${miss.length}: ${miss.join('、')}`);
