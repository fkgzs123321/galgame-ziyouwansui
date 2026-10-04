import fs from 'fs';
import path from 'path';

const dir = 'src/旮旯给木-伏魔记';
const js = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.includes('state') && !f.includes('schema'));
for (const j of js) {
  const fp = path.join(dir, j);
  if (fs.statSync(fp).size < 50000) continue;
  let obj;
  try { obj = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { continue; }
  const entries = obj?.data?.character_book?.entries || obj?.character_book?.entries || [];
  if (!entries.length) continue;
  console.log(`══ ${fp} — 条目 ${entries.length} ══`);
  let hit = 0;
  for (const e of entries) {
    const c = typeof e.content === 'string' ? e.content : '';
    if (!c.includes('<character_nsfw')) continue;
    console.log(`\n【${e.comment}】constant=${e.constant} keys=${JSON.stringify(e.keys)}`);
    const lines = c.split('\n');
    console.log('  首 6 行:');
    lines.slice(0, 6).forEach((l, n) => console.log(`   ${n + 1}| ${JSON.stringify(l.slice(0, 120))}`));
    console.log(`  共 ${lines.length} 行`);
    if (++hit >= 2) break;
  }
  break;
}
