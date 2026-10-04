// 一次性清洗：把早期产物里残留的臆造别名清掉，避免将来重跑链条时被带回。
//
// 背景：`索菲亚` 这个词在 4,868,725 字的原文里 0 命中，`费雯丽.李`/`赫莲娜.索菲亚`/
// `幽月儿.索菲亚`/`巢农.索菲亚`/`明姚.索菲亚` 同理，`米娅.哈姆` 的正确写法是中点
// `米娅·哈姆`（原文 L45750 唯一 1 处）。这些曾出现在 make-npc-patch.mjs 的 ALIAS 表里，
// 已从脚本清退；这里把两份旧产物也清一遍。详见 术语纪律.md。
import fs from 'fs';

const 改 = [
  ['src/兽血沸腾/tools/npc-created.json', [
    ['米娅.哈姆', '米娅·哈姆'],
  ]],
  ['src/兽血沸腾/tools/patch-npc.json', [
    ['米娅.哈姆', '米娅·哈姆'],
    ['费雯丽.李', '费雯丽'],
    ['赫莲娜.索菲亚', '赫莲娜'],
    ['幽月儿.索菲亚', '幽月儿'],
    ['巢农.索菲亚', '巢农主母'],
    ['明姚.索菲亚', '明姚'],
  ]],
];

let 总 = 0;
for (const [p, 规则] of 改) {
  if (!fs.existsSync(p)) { console.log('  跳过（不存在）: ' + p); continue; }
  let t = fs.readFileSync(p, 'utf8');
  const 行 = [];
  for (const [从, 到] of 规则) {
    const n = t.split(从).length - 1;
    if (n) { t = t.split(从).join(到); 行.push(`${从} → ${到} ×${n}`); 总 += n; }
  }
  fs.writeFileSync(p, t, 'utf8');
  console.log(`  ${p}\n     ${行.length ? 行.join('\n     ') : '（无命中）'}`);
}
console.log(`\n合计替换 ${总} 处`);
