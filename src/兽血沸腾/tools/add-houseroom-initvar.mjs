// 往 initvar.yaml 的 后宫 段补一个 房事: {} 键（schema.ts 已加同名字段）。
// 幂等：已经有就什么都不做。用脚本改而不是手改，避免 edit 工具在中文长行上匹配失败。
import fs from 'fs';

const P = 'src/兽血沸腾/世界书/变量/initvar.yaml';
let t = fs.readFileSync(P, 'utf8');

if (/^\s*房事:\s*\{\}\s*$/m.test(t)) {
  console.log('ℹ 已有 房事 键，未改动');
  process.exit(0);
}

// 先量出 后宫 段里 亲密记录 那一行的实际缩进，不假设缩进宽度
const m = t.match(/^([ \t]+)亲密记录:[ \t]*\{\}[ \t]*$/m);
if (!m) {
  console.error('✗ 找不到 后宫.亲密记录 行');
  process.exit(1);
}
const 缩进 = m[1];
const n = t.match(new RegExp(`^${缩进}亲密记录:[ \\t]*\\{\\}[ \\t]*$`, 'gm'))?.length ?? 0;
if (n !== 1) {
  console.error(`✗ 锚点出现 ${n} 次，不唯一，已中止`);
  process.exit(1);
}

const 新 = [
  `${缩进}# 房事名册以这里为准：私密档案覆盖全部成年女性，而 关系 只装开局即在场的那几位。`,
  `${缩进}# 关系.X.房事 若同时也被写过，视作同步副本，两边同值。`,
  `${缩进}房事: {}`,
  `${缩进}亲密记录: {}`,
].join('\n');

t = t.replace(m[0], 新);
fs.writeFileSync(P, t, 'utf8');
console.log(`✓ 已插入 房事 键（缩进 ${缩进.length} 空格），文件 ${Buffer.byteLength(t, 'utf8')} B`);
