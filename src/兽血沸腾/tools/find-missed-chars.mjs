// 找出「检测器漏掉的角色」：目录存在、但 demote-queue.json 里没有，
// 且文件内含终局态措辞。era-table 只收 165 人，队列因此先天不完整。
import fs from 'node:fs';
import path from 'node:path';

const 角色根 = 'src/兽血沸腾/世界书/角色';
const queue = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/demote-queue.json', 'utf8'));
const 已在队列 = new Set(queue.map(q => (q.文件.match(/角色[\\/]([^\\/]+)[\\/]/) || [])[1]).filter(Boolean));
const 未来 = /后为|后任|后来|最终|结局|终成|升任|改任|继任|即位|称帝|追封|此后|日后|最后成|当上|被提为|新任|现状/;

const 漏 = [];
for (const d of fs.readdirSync(角色根, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  if (已在队列.has(d.name)) continue;
  const f = path.join(角色根, d.name, '基础信息.yaml');
  if (!fs.existsSync(f)) continue;
  const 命中 = [];
  const Ls = fs.readFileSync(f, 'utf8').split('\n');
  let 节 = '?', 键 = '?';
  Ls.forEach((L, i) => {
    const t = L.trim();
    if (!t || t.startsWith('#')) return;
    const ind = L.match(/^\s*/)[0].length;
    const kv = t.match(/^([^:：]+):\s*(.*)$/);
    if (!kv) return;
    if (ind === 0) 节 = kv[1]; else if (ind === 2) 键 = kv[1];
    if (未来.test(kv[2])) 命中.push({ 行: i + 1, 节, 键, 文: kv[2].slice(0, 90) });
  });
  if (命中.length) 漏.push({ 名: d.name, 处: 命中.length, 命中 });
}

漏.sort((a, b) => b.处 - a.处);
const out = [`检测器漏掉的角色：${漏.length} 个`];
for (const m of 漏) {
  out.push(`\n══ ${m.名}（${m.处} 处）`);
  for (const h of m.命中) out.push(`  L${h.行} ${h.节}/${h.键}  ${h.文}`);
}
fs.writeFileSync('src/兽血沸腾/tools/_漏报角色.txt', out.join('\n'), 'utf8');
console.log(`漏报角色 ${漏.length} 个，共 ${漏.reduce((s, m) => s + m.处, 0)} 处 → tools/_漏报角色.txt`);
