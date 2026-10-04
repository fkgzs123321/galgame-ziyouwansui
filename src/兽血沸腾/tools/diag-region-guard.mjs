// 只读：打印一个「已守卫」地理条目的完整注册形状，作为 @@if + XML 包装的范本。
import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const M = st.entryManifest.地理;
let n = 0;
for (const [k, v] of Object.entries(M)) {
  if (!v.contents) continue;
  const hasIf = (v.contents || []).some(c => c.content && c.content.startsWith('@@if'));
  if (!hasIf) continue;
  console.log(`\n── 守卫地理条目「${k}」──`);
  console.log('   ' + JSON.stringify({ scope: v.scope, part: v.part, keywords: v.keywords, strategy: v.strategy, position: v.position }));
  v.contents.forEach((c, i) => console.log(`   contents[${i}]: ${c.content ? 'content=' + JSON.stringify(c.content) : 'file=' + c.file}`));
  const f = (v.contents || []).find(c => c.file)?.file;
  if (f) {
    const p = 'src/兽血沸腾/' + f;
    if (fs.existsSync(p)) fs.readFileSync(p, 'utf8').split('\n').slice(0, 2).forEach((x, i) => console.log(`      磁盘[${i + 1}] ${x}`));
  }
  if (++n >= 3) break;
}
console.log(`\n共找到含 @@if 的地理条目 ${Object.values(M).filter(v => (v.contents || []).some(c => c.content && c.content.startsWith('@@if'))).length} 个`);
