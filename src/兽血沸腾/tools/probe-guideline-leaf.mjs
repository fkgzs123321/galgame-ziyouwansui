// 只读：① 打印 扮演准则 的 leaf 形状（供新条目注册照抄）
//       ② 汇总 时间线/事件 里出现过的「可用角色」按纪元分布（作为纪元身份的取材依据）
import fs from 'fs';
import path from 'path';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const T = '扮演准则';
console.log(`══ state.entryManifest.${T} 的 leaf 形状 ══`);
for (const [k, v] of Object.entries(st.entryManifest[T] || {})) {
  console.log(`${k}: ${JSON.stringify(v)}`);
}

// 顶层 manifest 键
console.log(`\n══ entryManifest 顶层键 ══\n${Object.keys(st.entryManifest).join(' · ')}`);
console.log(`\n══ depth_defaults / 相关配置 ══\n${JSON.stringify(st.depth_defaults ?? null)}`);
for (const k of Object.keys(st)) if (k !== 'entryManifest') console.log(`   ${k}: ${JSON.stringify(st[k]).slice(0, 160)}`);
