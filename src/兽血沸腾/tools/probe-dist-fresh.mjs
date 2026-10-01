// 核验 dist 产物是否已跟上本轮前端改动。
import fs from 'fs';

const 查 = [
  ['dist/兽血沸腾/界面/状态栏/index.html', [['龙契烙印', 0], ['为救艾薇尔挥刀断臂后装上的秘银手臂', 1], ['义肢', 0]]],
  ['dist/兽血沸腾/界面/开局表单/index.html', [['起始章节序号', 1], ['侧重体验', 1]]],
];

for (const [f, 项] of 查) {
  if (!fs.existsSync(f)) { console.log(`✗ 缺文件 ${f}`); continue; }
  const t = fs.readFileSync(f, 'utf8');
  const st = fs.statSync(f);
  console.log(`\n══ ${f}  ${st.size} B  ${st.mtime.toISOString().slice(0, 19)} ══`);
  for (const [w, 期] of 项) {
    const n = t.split(w).length - 1;
    console.log(`   ${n === 期 ? '✓' : '✗'} 「${w}」 期望 ${期}，实际 ${n}`);
  }
}
