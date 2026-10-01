// 探针：NPC 的 参考语料 是否逐字（这是本卡「引文纪律」的既有判例）。
import fs from 'fs';
import path from 'path';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const D = 'src/兽血沸腾/世界书/NPC';

let 总 = 0, 坏总 = 0, 文件坏 = 0;
for (const f of fs.readdirSync(D).filter(x => x.endsWith('.yaml'))) {
  const t = fs.readFileSync(path.join(D, f), 'utf8');
  if (!/参考语料/.test(t)) continue;
  // 语料行：以 - 「…」 或 - 开头
  const L = t.split('\n');
  let 入 = false, 缩 = -1;
  const qs = [];
  for (const l of L) {
    const m = l.match(/^(\s*)参考语料\s*:/);
    if (m) { 入 = true; 缩 = m[1].length; continue; }
    if (入) {
      const ind = l.match(/^(\s*)/)[1].length;
      if (l.trim() === '') continue;
      if (ind <= 缩) { 入 = false; continue; }
      // 引号形式有 「」 “” 和 ASCII "" 三种，统一把首尾引号剥掉再比对
      const bare = l.replace(/^\s*-\s*/, '').trim()
        .replace(/^[「“"]/, '').replace(/[」”"]$/, '').trim();
      if (bare.length >= 8) qs.push(bare);
    }
  }
  if (!qs.length) continue;
  const 坏 = qs.filter(q => !原.includes(q));
  总 += qs.length; 坏总 += 坏.length;
  if (坏.length) {
    文件坏++;
    console.log(`\n【${f.replace(/\.yaml$/, '')}】${qs.length} 条中 ${坏.length} 条不符`);
    坏.slice(0, 2).forEach(q => {
      const 头 = q.slice(0, 8);
      const c = 原.split('\n').find(l => l.includes(头));
      console.log(`    ✗ 卡: ${q.slice(0, 60)}`);
      if (c) console.log(`      原: ${c.trim().slice(0, 60)}`);
    });
  }
}
console.log(`\n══ NPC 语料 ${总} 条，逐字不符 ${坏总} 条，涉及 ${文件坏} 个文件 ══`);
