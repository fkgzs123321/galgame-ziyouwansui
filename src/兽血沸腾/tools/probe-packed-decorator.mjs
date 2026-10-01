import fs from 'fs';
import path from 'path';

for (const proj of ['怨妇救赎', '不要玩弄我的鸡吧-forge']) {
  const dir = path.join('src', proj);
  const jsons = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.includes('schema') && !f.includes('state')) : [];
  console.log(`\n════ ${proj} 打包产物: ${jsons.join(', ') || '(无)'} ════`);
  for (const j of jsons) {
    let o;
    try { o = JSON.parse(fs.readFileSync(path.join(dir, j), 'utf8')); } catch (e) { console.log('  解析失败', e.message); continue; }
    const entries = o?.data?.character_book?.entries || o?.character_book?.entries || [];
    console.log(`  条目总数 ${entries.length}`);
    for (const e of entries) {
      if (!/阶段行为|私密档案/.test(String(e.comment))) continue;
      const lines = String(e.content).split('\n');
      console.log(`\n  【${e.comment}】constant=${e.constant} keys=${JSON.stringify(e.keys)} position=${e.position} order=${e.order}`);
      lines.slice(0, 3).forEach((l, n) => console.log(`     ${n + 1}| ${l.slice(0, 130)}`));
      console.log(`     ... 共 ${lines.length} 行`);
    }
  }
}
