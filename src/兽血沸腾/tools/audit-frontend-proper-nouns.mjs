// 前端界面里的专名审查：面板标签/节点名/按钮文案中出现的世界内专名，必须有原文依据。
//
// 这是 `龙契烙印` 缺陷的同一类：该词正是因为被收进 私密部位.ts 而进了前端。
// 前端专名会直接摆给玩家看，所以与条目名同等对待。
import fs from 'fs';
import path from 'path';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 有 = s => 原.includes(s);

const DIRS = ['src/兽血沸腾/界面'];
const 文件 = [];
for (const D of DIRS) {
  const 走 = d => {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) { if (!/node_modules|dist/.test(p)) 走(p); }
      else if (/\.(vue|ts|html)$/.test(f)) 文件.push(p);
    }
  };
  走(D);
}

// 只取「像专名」的中文串：书名号内容、以及被当作节点/标签的键
const 候选 = new Map();
const 记 = (w, 处) => {
  if (!w || w.length < 2 || w.length > 16) return;
  if (!候选.has(w)) 候选.set(w, new Set());
  候选.get(w).add(处);
};

for (const p of 文件) {
  const t = fs.readFileSync(p, 'utf8');
  const 处 = p.replace(/\\/g, '/').split('/').slice(-2).join('/');
  for (const m of t.matchAll(/《([^》]{1,14})》/g)) 记(m[1].trim(), 处);
  // 战歌/技能/科技节点的常量数组
  for (const m of t.matchAll(/(?:战歌|技能|科技|兵种|名器|魔宠)[^\n]{0,12}?[:=]\s*['"]([^'"]{2,14})['"]/g)) 记(m[1].trim(), 处);
}

// 通用词白名单（不含世界专名）
const 白 = /^(总览|战斗|技能树|领地|角色|剧情|魔宠|装备|后宫|自定义|状态|记录|说明|返回|确定|取消|保存|添加|删除|修改|下一天|下一回合|开始|结束)$/;

const 缺 = [];
for (const [w, 处s] of 候选) {
  if (白.test(w)) continue;
  if (有(w)) continue;
  缺.push([w, [...处s]]);
}

console.log(`══ 扫描前端 ${文件.length} 个文件，提取书名号/节点常量 ${候选.size} 个 ══`);
console.log(`══ 其中原文 0 命中：${缺.length} 个 ══\n`);
for (const [w, 处s] of 缺.sort((a, b) => a[0].length - b[0].length)) {
  console.log(`   「${w}」  ${处s.slice(0, 4).join(' · ')}`);
}
if (!缺.length) console.log('   （无）');
