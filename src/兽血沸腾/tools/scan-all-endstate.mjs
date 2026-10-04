// 全面终局态扫描：不依赖 era-table（只收 165 人）、不依赖 probe-era-faces 的窄正则。
// 直接扫 角色/**/基础信息.yaml 与 NPC/**.yaml，用一组更宽的「未来时态」标记，
// 目的是把「还没登场但文件已写成终局」的处一次性列全。
import fs from 'node:fs';
import path from 'node:path';

const 根 = 'src/兽血沸腾/世界书';
const 标记 = /后来|后为|后任|此后|日后|最终|结局|终成|终归|升任|改任|继任|即位|称帝|追封|当上|被提为|新任|成为|成了|变成了|晋升|拔擢|加冕|登基|最后|战死后|阵亡后|最终成|长大后|再后来|此时已|已经成/;

function 扫(文件) {
  const rel = path.relative(根, 文件).replace(/\\/g, '/');
  const Ls = fs.readFileSync(文件, 'utf8').split('\n');
  if (Ls.some(l => l.includes('<%_'))) return null; // 已分档，跳过
  const 节 = { v: '?' };
  let 键 = '?';
  const 命中 = [];
  Ls.forEach((L, i) => {
    const t = L.trim();
    if (!t || t.startsWith('#') || t.startsWith('@@')) return;
    const ind = L.match(/^\s*/)[0].length;
    const kv = t.match(/^([^:：]+):\s*(.*)$/);
    if (!kv) return;
    if (ind === 0) 节.v = kv[1];
    else if (ind === 2) 键 = kv[1];
    if (标记.test(kv[2])) 命中.push({ 行: i + 1, 节: 节.v, 键, 文: kv[2].slice(0, 100) });
  });
  return 命中.length ? { rel, 命中 } : null;
}

const 结果 = [];
const 角色根 = path.join(根, '角色');
for (const d of fs.readdirSync(角色根, { withFileTypes: true })) {
  const f = d.isDirectory() ? path.join(角色根, d.name, '基础信息.yaml') : null;
  if (f && fs.existsSync(f)) { const r = 扫(f); if (r) 结果.push({ 名: d.name, ...r }); }
}
const NPC根 = path.join(根, 'NPC');
for (const f of fs.readdirSync(NPC根)) {
  if (!f.endsWith('.yaml')) continue;
  const p = path.join(NPC根, f);
  const r = 扫(p);
  if (r) 结果.push({ 名: f.replace(/\.yaml$/, ''), ...r });
}

结果.sort((a, b) => b.命中.length - a.命中.length);
const out = [`未分档且含未来时态的文件：${结果.length} 个，共 ${结果.reduce((s, r) => s + r.命中.length, 0)} 处`, ''];
for (const r of 结果) {
  out.push(`══ ${r.名}（${r.命中.length} 处）  ${r.rel}`);
  for (const h of r.命中) out.push(`   L${h.行} ${h.节}/${h.键}  ${h.文}`);
}
fs.writeFileSync('src/兽血沸腾/tools/_全面终局态扫描.txt', out.join('\n'), 'utf8');
console.log(`未分档且含未来时态：${结果.length} 个文件 / ${结果.reduce((s, r) => s + r.命中.length, 0)} 处 → tools/_全面终局态扫描.txt`);
