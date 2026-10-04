// 只读：各开局 initvar 的 关系.* 键与其 关系阶段/好感度，作为软降级的权威依据。
import fs from 'fs';

for (const f of fs.readdirSync('src/兽血沸腾/开场白/initvar').sort()) {
  const t = fs.readFileSync('src/兽血沸腾/开场白/initvar/' + f, 'utf8');
  const 章 = (t.match(/章节序号:\s*(\d+)/) || [])[1];
  const 卷 = (t.match(/当前卷:\s*(.*)/) || [])[1];
  console.log(`\n════ ${f}  章=${章}  卷=${(卷 || '').trim()} ════`);

  // 定位 关系: 段
  const 起 = t.search(/^关系:\s*$/m);
  if (起 < 0) { console.log('  (无 关系 段)'); continue; }
  const 后 = t.slice(起);
  const 尾 = 后.search(/\n[^\s]/);
  const 段 = 尾 > 0 ? 后.slice(0, 尾) : 后;

  const 名 = [...段.matchAll(/^  ([\u4e00-\u9fa5.\u00b7]{2,12}):\s*$/gm)].map(m => m[1]);
  console.log(`  关系键 ${名.length} 个：${名.join('、')}`);
  for (const n of 名) {
    const re = new RegExp('^  ' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\s*$([\\s\\S]*?)(?=^  \\S|\\Z)', 'm');
    const b = 段.match(re);
    if (!b) continue;
    const 阶 = (b[1].match(/关系阶段:\s*([^\n]+)/) || [])[1];
    const 好 = (b[1].match(/好感度:\s*(-?\d+)/) || [])[1];
    console.log(`     ${n.padEnd(12)} 阶段=${(阶 || '?').trim().padEnd(6)} 好感=${好 ?? '?'}`);
  }
}
