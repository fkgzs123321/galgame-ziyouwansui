import fs from 'fs';
import path from 'path';

const cands = ['旮旯给木-伏魔记', '旮旯给木-英雄坛说', '怨妇救赎', '欲望都市'];
for (const p of cands) {
  const dir = path.join('src', p);
  if (!fs.existsSync(dir)) continue;
  const js = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.includes('state') && !f.includes('schema'));
  for (const j of js) {
    const fp = path.join(dir, j);
    if (fs.statSync(fp).size < 20000) continue;
    const raw = fs.readFileSync(fp, 'utf8');
    const i = raw.indexOf('<character_nsfw');
    const k = raw.indexOf('<character_other');
    const idx = i >= 0 ? i : k;
    if (idx < 0) continue;
    console.log(`${'═'.repeat(78)}\n══ ${fp}  (${(fs.statSync(fp).size / 1024).toFixed(0)} KB) ══`);
    console.log('---- 命中位置前后 700 字符（原始 JSON 转义前）----');
    let obj;
    try { obj = JSON.parse(raw); } catch { console.log('  (整体非 JSON)'); continue; }
    const entries = obj?.data?.character_book?.entries || obj?.character_book?.entries || [];
    for (const e of entries) {
      if (typeof e.content !== 'string') continue;
      if (!e.content.includes('<character_nsfw') && !e.content.includes('<character_other')) continue;
      console.log(`\n【${e.comment}】 constant=${e.constant} keys=${JSON.stringify(e.keys)}`);
      const lines = e.content.split('\n');
      console.log('  首 8 行:');
      lines.slice(0, 8).forEach((l, n) => console.log(`   ${n + 1}| ${l.slice(0, 170)}`));
      console.log('  末 3 行:');
      lines.slice(-3).forEach(l => console.log(`     | ${l.slice(0, 170)}`));
      console.log(`  （共 ${lines.length} 行 / ${e.content.length} 字符）`);
      break;
    }
    break;
  }
}
