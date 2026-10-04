// 从 _全面终局态扫描.txt 里把「文件 → 处数」列出来，供派工与核对。
import fs from 'node:fs';

const t = fs.readFileSync('src/兽血沸腾/tools/_全面终局态扫描.txt', 'utf8').split(/\r?\n/);
const 行 = [];
let cur = null;
for (const l of t) {
  const h = l.match(/^══ (.+?)（(\d+) 处）\s+(.+?)$/);
  if (h) { cur = { 名: h[1], 处: Number(h[2]), 文件: h[3].trim(), 样: [] }; 行.push(cur); continue; }
  if (cur && /^\s+L\d+ /.test(l) && cur.样.length < 2) cur.样.push(l.trim());
}
行.sort((a, b) => b.处 - a.处);
console.log(`文件 ${行.length} 个，合计 ${行.reduce((s, x) => s + x.处, 0)} 处`);
console.log('');
for (const x of 行) console.log(`  ${String(x.处).padStart(2)}  ${x.名}  (${x.文件})`);
fs.writeFileSync('src/兽血沸腾/tools/_待办角色.txt', 行.map(x => `${x.处}\t${x.名}\t${x.文件}`).join('\n'), 'utf8');
console.log('\n名单已写 tools/_待办角色.txt');
