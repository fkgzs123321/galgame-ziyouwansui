// 聚焦排查：只有会进前端的「部位键」才需要专名级审查。
//
// extract-nsfw-parts.mjs 只读每个 私密.yaml 的 `外观:` 段，把该段下的键
// 收进 界面/私密部位.ts（前端部位表）。`龙契烙印` 就是从这里漏进去的臆造专名。
// 因此本脚本只做一件事：把这 25 个 `外观:` 段的键全部列出，逐个查原文命中。
import fs from 'fs';
import path from 'path';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 有 = s => 原.includes(s);

const ROOT = 'src/兽血沸腾/世界书/角色';
const 段键 = new Map(); // 键 → Set(角色)

for (const d of fs.readdirSync(ROOT)) {
  const p = path.join(ROOT, d, '私密.yaml');
  if (!fs.existsSync(p)) continue;
  const 行 = fs.readFileSync(p, 'utf8').split('\n');
  let 在 = false, 缩进 = null;
  for (const l of 行) {
    if (/^外观:/.test(l)) { 在 = true; 缩进 = null; continue; }
    if (!在) continue;
    if (/^[^\s]/.test(l) && l.trim()) break;        // 回到顶层段，结束
    const m = l.match(/^(\s+)([^\s#][^:]*):/);
    if (!m) continue;
    if (缩进 === null) 缩进 = m[1].length;
    if (m[1].length !== 缩进) continue;
    const k = m[2].trim();
    if (!段键.has(k)) 段键.set(k, new Set());
    段键.get(k).add(d);
  }
}

const 缺 = [...段键].filter(([k]) => !有(k));
const 齐 = [...段键].filter(([k]) => 有(k));

console.log(`══ 部位键共 ${段键.size} 个 ══`);
console.log(`   原文有据：${齐.length} 个`);
console.log(`   原文 0 命中：${缺.length} 个\n`);

if (缺.length) {
  console.log('── 原文 0 命中的部位键（逐个判定是臆造专名还是通用解剖词）──');
  for (const [k, s] of 缺) console.log(`   「${k}」  出现于 ${s.size} 人：${[...s].join(' · ')}`);
}

console.log('\n── 全部部位键一览（原文有据）──');
console.log('   ' + 齐.map(([k]) => k).sort().join(' · '));
