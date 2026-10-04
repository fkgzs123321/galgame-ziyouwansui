// 往各开场白 initvar 的 后宫 段补 房事: {}（与 schema.ts / initvar.yaml 对齐）。
// 幂等；缩进按 后宫 段内 亲密记录 行的实际缩进来定，不假设宽度。
import fs from 'fs';

const 文件 = [
  'src/兽血沸腾/开场白/initvar/2.yaml',
  'src/兽血沸腾/开场白/initvar/3.yaml',
  'src/兽血沸腾/开场白/initvar/4.yaml',
  'src/兽血沸腾/开场白/initvar/5.yaml',
  'src/兽血沸腾/开场白/initvar/6.yaml',
];

for (const p of 文件) {
  let t = fs.readFileSync(p, 'utf8');
  const 行 = t.split('\n');

  // 定位顶层 后宫: 段的范围（到下一个零缩进的顶层键为止）
  const start = 行.findIndex(l => /^后宫:\s*$/.test(l));
  if (start < 0) {
    console.log(`✗ ${p}: 找不到顶层 后宫:`);
    continue;
  }
  let end = 行.length;
  for (let i = start + 1; i < 行.length; i++) {
    if (/^\S/.test(行[i])) {
      end = i;
      break;
    }
  }

  const 段 = 行.slice(start, end);
  if (段.some(l => /^\s*房事:/.test(l))) {
    console.log(`ℹ ${p}: 已有 房事，跳过`);
    continue;
  }

  // 以段内 亲密记录 那一行为锚，取其缩进
  const 锚相对 = 段.findIndex(l => /^\s*亲密记录:/.test(l));
  if (锚相对 < 0) {
    console.log(`✗ ${p}: 后宫 段内找不到 亲密记录`);
    continue;
  }
  const 缩进 = 段[锚相对].match(/^\s*/)[0];

  段.splice(锚相对, 0, `${缩进}房事: {}`);
  行.splice(start, end - start, ...段);
  fs.writeFileSync(p, 行.join('\n'), 'utf8');
  console.log(`✓ ${p}: 已在 后宫 段插入 房事: {}（缩进 ${缩进.length}）`);
}
