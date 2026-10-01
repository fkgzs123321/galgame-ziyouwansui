// 宽松版进度探针：只问「文件里有没有 EJS 控制流」，不限定写法。
// 严格版（probe-era-progress.mjs）只认 `<%_ if (getvar('stat_data.剧情.章节序号'` 这一种字面形式，
// 子代理若换行、换引号或有缩进就会被漏计，不适合用来判断「这个文件到底动没动」。
import fs from 'node:fs';
import path from 'node:path';

function 遍历(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) 遍历(p, out);
    else if (e.name.endsWith('.yaml')) out.push(p);
  }
  return out;
}

const 根 = 'src/兽血沸腾/世界书';
const 全部 = 遍历(根);
const 行 = [];
for (const p of 全部) {
  const t = fs.readFileSync(p, 'utf8');
  const rel = path.relative(根, p).replace(/\\/g, '/');
  const 门 = (t.match(/<%_\s*if\s*\(/g) || []).length;
  const 章 = (t.match(/章节序号/g) || []).length;
  const 未 = (t.match(/后为|后任|后来|最终|结局|终成|升任|改任|继任|即位|称帝|追封|此后|日后|战死|阵亡|最后成|当上|被提为|新任|现状/g) || []).length;
  if (门 || 章) 行.push({ rel, 门, 章, 未 });
}
行.sort((a, b) => b.门 - a.门);
console.log(`含 EJS 控制流或章节序号 的文件: ${行.length} 个`);
for (const x of 行) console.log(`  门${String(x.门).padStart(3)} 章${String(x.章).padStart(3)} 未来词${String(x.未).padStart(2)}  ${x.rel}`);
fs.writeFileSync('src/兽血沸腾/tools/_宽松进度.txt', 行.map(x => `${x.门}\t${x.章}\t${x.未}\t${x.rel}`).join('\n'), 'utf8');
