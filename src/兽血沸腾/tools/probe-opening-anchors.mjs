// 只读：每个开局的章节序号 + 该时点已/未成立的关键关系。
import fs from 'fs';
import path from 'path';

const 开场 = 'src/兽血沸腾/开场白';
for (const f of fs.readdirSync(开场).sort()) {
  const p = path.join(开场, f);
  if (fs.statSync(p).isDirectory()) continue;
  console.log(`── ${f}  ${fs.statSync(p).size} B`);
  if (!f.endsWith('.txt') && !f.endsWith('.md')) continue;
  const t = fs.readFileSync(p, 'utf8');
  // 找章节/卷信息
  const m = t.match(/[^\n]*(?:第[一二三四五六七八九十百零\d]+章|章节序号|当前卷|开局)[^\n]*/g);
  if (m) m.slice(0, 6).forEach(x => console.log('     ' + x.trim().slice(0, 100)));
}

console.log('\n══ initvar 各开局的章节序号 / 关系 ══');
const iv = path.join(开场, 'initvar');
for (const f of fs.readdirSync(iv).sort()) {
  const t = fs.readFileSync(path.join(iv, f), 'utf8');
  const 章 = (t.match(/章节序号:\s*(\d+)/) || [])[1];
  const 卷 = (t.match(/当前卷:\s*(.*)/) || [])[1];
  const 关 = t.match(/^  关系:/m) ? '有' : '无';
  const 名 = [...t.matchAll(/^    ([\u4e00-\u9fa5.\u00b7]{2,10}):/gm)].map(x => x[1]);
  console.log(`  ${f.padEnd(10)} 章节序号=${String(章 ?? '?').padStart(4)}  卷=${(卷 || '?').trim().padEnd(12)} 关系段=${关}  键=${名.length}`);
}
