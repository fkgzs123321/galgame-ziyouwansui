import fs from 'fs';
const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));

function show(类型, 名) {
  const v = st.entryManifest?.[类型]?.[名];
  if (!v) { console.log(`「${类型}/${名}」不存在`); return; }
  console.log(`\n══ ${类型}/${名} ══`);
  console.log('  keys: ' + Object.keys(v).join(','));
  console.log('  path: ' + (v.path ?? '(无)'));
  if (v.contents) {
    v.contents.forEach((c, i) => {
      const s = c.file ? `{file: ${c.file}}` : JSON.stringify(c.content ?? '');
      console.log(`  contents[${i}]: ${s.length > 130 ? s.slice(0, 130) + '…' : s}`);
    });
  }
}
// 时间线（已证实的双装饰器范本）与编年
for (const n of ['主角前史', '荒岛篇编年', '海神岛篇', '大陆历史', '当前剧情进度', '纵横篇·成长期进度']) show('时间线', n);
// 地理（已证实的 contents 门范本）
const 地理keys = Object.keys(st.entryManifest.地理 ?? {});
console.log(`\n地理条目 ${地理keys.length} 个，带 contents 的：`);
for (const k of 地理keys) {
  const v = st.entryManifest.地理[k];
  if (v.contents) show('地理', k);
}
