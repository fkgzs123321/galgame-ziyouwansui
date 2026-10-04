// 只读：扮演准则条目的注册形状与磁盘首行，作为「纪元分层准则」的范本。
import fs from 'fs';

const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));
const M = st.entryManifest.扮演准则;
console.log(`扮演准则 ${Object.keys(M).length} 个：`);
for (const [k, v] of Object.entries(M)) {
  const f = v.path || (v.contents || []).find(c => c.file)?.file;
  let 首 = '';
  if (f && fs.existsSync(`${PROJ}/${f}`)) 首 = (fs.readFileSync(`${PROJ}/${f}`, 'utf8').split('\n')[0] || '').slice(0, 70);
  console.log(`\n── ${k} ──`);
  console.log('   ' + JSON.stringify({ 注册: v.contents ? 'contents' : 'path', scope: v.scope, part: v.part, keywords: v.keywords, strategy: v.strategy, position: v.position }));
  console.log(`   文件=${f}`);
  console.log(`   首行「${首}」`);
}

// depth_defaults + 事件/时间线 的 position 参照
console.log('\n══ state 顶层 depth_defaults ══');
console.log('   ' + JSON.stringify(st.depth_defaults));

console.log('\n══ 时间线 条目注册参照（取 2 个）══');
const T = st.entryManifest.时间线;
Object.entries(T).slice(0, 2).forEach(([k, v]) => {
  console.log(`   ${k}: ${JSON.stringify({ scope: v.scope, part: v.part, keywords: v.keywords, strategy: v.strategy, position: v.position })}`);
});
console.log(`   时间线条目共 ${Object.keys(T).length}`);
