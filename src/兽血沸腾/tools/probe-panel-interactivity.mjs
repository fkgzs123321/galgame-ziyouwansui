// 核验「控制中心」要求：前端不只是显示，还要能操作。
// 统计每个面板里的交互元素（按钮/下拉/输入/点击处理器）与写回变量的调用。
import fs from 'fs';
import path from 'path';

const DIR = 'src/兽血沸腾/界面/状态栏';
const COMP = path.join(DIR, 'components');

const 面板 = [];
for (const f of fs.readdirSync(COMP).sort()) 面板.push([f, path.join(COMP, f)]);
面板.push(['App.vue', path.join(DIR, 'App.vue')]);
for (const f of fs.readdirSync(DIR)) {
  if (f.endsWith('.vue')) 面板.push([f, path.join(DIR, f)]);
}

console.log('面板'.padEnd(26) + '行数'.padStart(6) + '<button'.padStart(9) + 'select'.padStart(8) + '@click'.padStart(8) + '@change'.padStart(9) + '写变量'.padStart(8));
console.log('─'.repeat(76));

let 总写 = 0, 总点 = 0;
for (const [f, p] of 面板) {
  const t = fs.readFileSync(p, 'utf8');
  const 数 = re => (t.match(re) ?? []).length;
  const 行 = t.split('\n').length;
  const btn = 数(/<button/g);
  const sel = 数(/<select/g);
  const clk = 数(/@click/g);
  const chg = 数(/@change/g);
  // 写回 MVU 的调用
  const 写 = 数(/\b(?:写入|写回|setField|update|store\.[a-zA-Z]*\s*=|\.value\s*=)/g);
  const 真写 = 数(/store\.|写入变量|写回变量|Mvu\.|replaceVariables|writeVariable/g);
  总写 += 真写; 总点 += clk;
  console.log(f.padEnd(26) + String(行).padStart(6) + String(btn).padStart(9) + String(sel).padStart(8) + String(clk).padStart(8) + String(chg).padStart(9) + String(真写).padStart(8));
}
console.log('─'.repeat(76));
console.log(`合计：@click ${总点} 处，store/变量写回相关 ${总写} 处`);

// 战歌/领地的具体动作
console.log('\n── SkillTreePanel 的动作函数 ──');
const sk = fs.readFileSync(path.join(COMP, 'SkillTreePanel.vue'), 'utf8');
for (const m of sk.matchAll(/function\s+(\w+)/g)) console.log(`   ${m[1]}`);
console.log('\n── TerritoryPanel 的动作函数 ──');
const te = fs.readFileSync(path.join(COMP, 'TerritoryPanel.vue'), 'utf8');
for (const m of te.matchAll(/function\s+(\w+)/g)) console.log(`   ${m[1]}`);
console.log('\n── BattlePanel 的动作函数 ──');
const ba = fs.readFileSync(path.join(COMP, 'BattlePanel.vue'), 'utf8');
for (const m of ba.matchAll(/function\s+(\w+)/g)) console.log(`   ${m[1]}`);
