// 只读探针 v2：把 contents 里引用的 file 也算作注册。
import fs from 'fs';
import path from 'path';

const S = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const BOOK = 'src/兽血沸腾/世界书';

const walk = d =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)],
  );

const 注册 = new Set();
for (const [类型, 条目] of Object.entries(S.entryManifest)) {
  for (const v of Object.values(条目)) {
    if (v.path) 注册.add(v.path.replace(/\\/g, '/'));
    for (const c of v.contents || []) {
      if (c && c.file) 注册.add(String(c.file).replace(/\\/g, '/'));
    }
  }
}

const 文件 = walk(BOOK)
  .filter(f => f.endsWith('.yaml'))
  .map(f => f.replace(/\\/g, '/').replace('src/兽血沸腾/', ''));

const 未注册 = 文件.filter(f => !注册.has(f));
const 注册但无文件 = [...注册].filter(f => !文件.includes(f) && !fs.existsSync(path.join('src/兽血沸腾', f)));

console.log(`磁盘 yaml ${文件.length} 个，注册引用 ${注册.size} 个`);
console.log(`\n未注册 (${未注册.length}):`);
未注册.forEach(f => console.log('   ' + f));
console.log(`\n注册了但两处都找不到 (${注册但无文件.length}):`);
注册但无文件.forEach(f => console.log('   ' + f));

// 变量 txt 实际在哪
console.log('\n── 变量目录实际内容 ──');
fs.readdirSync('src/兽血沸腾/世界书/变量').forEach(f =>
  console.log(`   ${f}  ${fs.statSync(path.join('src/兽血沸腾/世界书/变量', f)).size} B`),
);
