// 补关键词补丁：把漏掉的原文异写补到既有条目上
import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

// 文件名（条目名）→ 需追加的关键词
const ADD = {
  '白素青_基础信息': ['青雅', '青雅.白玉'],
  '白素青_性格调色盘': ['青雅', '青雅.白玉'],
  '白素青_私密档案': ['青雅', '青雅.白玉'],
  '白素青_私密阶段': ['青雅', '青雅.白玉'],
};

const ops = [];
for (const [name, extra] of Object.entries(ADD)) {
  for (const [type, items] of Object.entries(st.entryManifest)) {
    const v = items[name];
    if (!v) continue;
    const kw = [...new Set([...(v.keywords || []), ...extra])].filter(k => k.length >= 2);
    const keys = [...new Set([...(v.strategy?.keys || []), ...extra])].filter(k => k.length >= 2);
    ops.push({ op: 'replace', path: `/entryManifest/${type}/${name}/keywords`, value: kw });
    if (v.strategy?.type === 'selective')
      ops.push({ op: 'replace', path: `/entryManifest/${type}/${name}/strategy/keys`, value: keys });
    console.log(`${type}/${name} → ${kw.join(', ')}`);
  }
}
fs.writeFileSync('src/兽血沸腾/tools/patch-aliases.json', JSON.stringify(ops, null, 2), 'utf8');
console.log(`\n生成 ${ops.length} 个操作`);
