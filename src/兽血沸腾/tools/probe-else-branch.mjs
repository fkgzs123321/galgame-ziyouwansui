// 当前剧情进度.yaml 的最后一个 else 分支覆盖 73~763，把纵横篇终局也写进去了。
// 拆成与 9 篇进度一致的三档：成长期 73-244 / 扩张期 245-704 / 终盘 705-763。
import fs from 'fs';
const P = 'src/兽血沸腾/世界书/时间线/当前剧情进度.yaml';
const raw = fs.readFileSync(P, 'utf8');
const lines = raw.split('\n');

const i = lines.findIndex(l => l.includes("} else {"));
if (i < 0) { console.log('未找到 else 分支，可能已改过'); process.exit(1); }
console.log('找到 else 于第', i + 1, '行:', lines[i].trim());

// 原 else 段：从 else 行到结尾的 <%_ } _%>
const tail = lines.slice(i);
const endIdx = tail.findIndex((l, n) => n > 0 && /^<%_\s*\}\s*_%>\s*$/.test(l));
console.log('else 段结束于第', i + endIdx + 1, '行');
console.log('\n原 else 段内容:');
tail.slice(0, endIdx + 1).forEach((l, n) => console.log(`  ${i + n + 1}| ${l}`));
