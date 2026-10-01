import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const em = st.entryManifest || {};
console.log('类型:', Object.keys(em).join(' / '));
for (const k of Object.keys(em)) console.log(`  ${k}: ${Object.keys(em[k] || {}).length}`);
console.log('\n══ NPC 已注册条目 ══');
for (const [n, v] of Object.entries(em.NPC || {})) {
  console.log(`  ${n}  | part=${v.part} scope=${v.scope} strategy=${JSON.stringify(v.strategy)}`);
  console.log(`      path=${v.path}  keys=${JSON.stringify(v.keywords || v.strategy?.keys || [])}`);
}
console.log('\n══ 事件样例（参考 shape）══');
const ev = Object.entries(em.事件 || {})[0];
console.log(JSON.stringify(ev, null, 2).slice(0, 900));
