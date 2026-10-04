// npc.md L46-48 要求「5-10 句典型对话」；此处核对每份 NPC 文件的实际语料条数
import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
const rows = [];
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml'))) {
  const t = fs.readFileSync(path.join(NPC, f), 'utf8');
  const seg = t.split(/^  参考语料:\s*$/m)[1];
  const n = seg ? (seg.match(/^    - "/gm) || []).length : 0;
  rows.push({ name: f.replace(/\.yaml$/, ''), n, size: fs.statSync(path.join(NPC, f)).size });
}
const noQ = rows.filter(r => r.n === 0);
const low = rows.filter(r => r.n >= 1 && r.n < 5);
const ok = rows.filter(r => r.n >= 5);
console.log(`全部 ${rows.length} 个：0 条(原文确无语料) ${noQ.length} · 1-4 条(不足) ${low.length} · >=5 条(达标) ${ok.length}\n`);
console.log('── 语料 1-4 条（未达 npc.md 的 5-10 条要求）──');
for (const r of low.sort((a, b) => a.n - b.n)) console.log(`  ${r.n} 条  ${String(r.size).padStart(5)} B  ${r.name}`);
console.log('\n── 语料 0 条 ──');
console.log('  ' + noQ.map(r => r.name).join(' · '));
