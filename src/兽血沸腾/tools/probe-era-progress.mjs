// 进度探针：统计有多少条 基础信息.yaml 已经写进内联分档。
// 批量改写期间用它看进度，不用去数每个子代理的回报。
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
const 全部 = 遍历(根).filter(p => p.includes('角色') || p.includes('NPC'));
const 已 = [], 未 = [];
for (const p of 全部) {
  const t = fs.readFileSync(p, 'utf8');
  const n = (t.match(/<%_ if \(getvar\('stat_data\.剧情\.章节序号'/g) || []).length;
  const rel = path.relative(根, p).replace(/\\/g, '/');
  if (n > 0) 已.push({ rel, n }); else 未.push(rel);
}
已.sort((a, b) => b.n - a.n);
console.log(`已分档 ${已.length} 个文件 / 未分档 ${未.length} 个（共 ${全部.length}）`);
console.log(`\n── 已分档 ──`);
for (const x of 已) console.log(`  ${String(x.n).padStart(3)} 处  ${x.rel}`);
fs.writeFileSync('src/兽血沸腾/tools/_分档进度.txt', 已.map(x => `${x.n}\t${x.rel}`).join('\n'), 'utf8');
