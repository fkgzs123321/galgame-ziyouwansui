// 只读：打印 海伦.列娜 / 刘震撼 全部条目的注册形状与内容文件首行。
import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const M = st.entryManifest.角色;

for (const 前 of ['海伦.列娜', '刘震撼']) {
  console.log(`\n════════ ${前} ════════`);
  for (const [k, v] of Object.entries(M)) {
    if (!k.startsWith(前)) continue;
    console.log(`\n── ${k} ──`);
    console.log('   ' + JSON.stringify({ path: v.path, scope: v.scope, part: v.part, keywords: v.keywords, strategy: v.strategy, position: v.position }));
    if (v.contents) {
      v.contents.forEach((c, i) => {
        console.log(`   contents[${i}]: ${c.content ? 'content=' + JSON.stringify(c.content) : 'file=' + c.file}`);
      });
    }
    const f = v.path || (v.contents || []).find(c => c.file)?.file;
    if (f) {
      const p = 'src/兽血沸腾/' + f;
      if (fs.existsSync(p)) {
        const L = fs.readFileSync(p, 'utf8').split('\n');
        console.log(`   磁盘 ${f} 首 3 行:`);
        L.slice(0, 3).forEach((x, i) => console.log(`      [${i + 1}] ${x}`));
      } else console.log(`   ⚠ 磁盘无 ${f}`);
    }
  }
}
