// 打印 state.json 里既有的 私密 / 私密阶段 注册形状，作为新增条目的样板。
import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const R = st.entryManifest['角色'] || {};

const keys = Object.keys(R);
console.log(`角色 条目共 ${keys.length}`);
for (const k of keys) {
  if (k.includes('私密')) console.log(`  [私密类] ${k}  part=${R[k].part ?? '(无)'}  order=${R[k].position?.order ?? '?'}`);
}

// 打印一个 私密档案 和一个 私密阶段 的完整形状
for (const suffix of ['_私密档案', '_私密阶段']) {
  const k = Object.keys(R).find(x => x.endsWith(suffix));
  console.log(`\n════ ${k} ════`);
  console.log(JSON.stringify(R[k], null, 2));
}

// 全部 order，观察编号规律
const orders = Object.entries(R).filter(([k]) => k.includes('私密')).map(([k, v]) => [k, v.position?.order]);
console.log('\n══ order 排序 ══');
orders.sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0)).forEach(([k, o]) => console.log(`  ${String(o).padStart(5)}  ${k}`));
