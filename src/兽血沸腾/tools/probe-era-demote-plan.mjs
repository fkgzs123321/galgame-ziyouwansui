// 只读：把 41 人实务集的「每个纪元需要降级哪些小节」压成一张可执行的清单。
// 输出：每个角色 → 需软降级的 [节/键] 列表 + 建议的降级动作。
import fs from 'fs';

const rows = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-faces.json', 'utf8'));

// 已知的「该键属于哪个纪元」人工判定表：键名 → 该键描述的纪元下界（章节）
// 只列需要降级的；未列出的键视为全纪元通用。
const 键纪元 = {
  '身份': 0,            // 需要按卷分支重写，特殊处理
  '与主角关系': 0,
  '阶位经历': 0,
  '终盘': 705,
  '花界形态': 705,
  '花系': 705,
  '龙力': 500,
  '母亲身份': 300,
  '蜕变': 245,
  '珠胎': 200,
  '收场': 245,
  '护徒': 245,
  '头饰': 245,
};

const 实务 = rows.filter(r => (r.登场 ?? 999) <= 245);
const 桶 = { 身份类: [], 叙述类: [] };
for (const r of 实务) {
  for (const h of r.命中) {
    if (['身份', '与主角关系'].includes(h.键)) 桶.身份类.push({ 名: r.名, 登场: r.登场, 键: h.键, 文: h.文 });
    else 桶.叙述类.push({ 名: r.名, 登场: r.登场, 节: h.节, 键: h.键, 文: h.文, 建议下界: 键纪元[h.键] ?? null });
  }
}

console.log(`实务集 ${实务.length} 人\n`);
console.log(`══ 桶一：身份类（基本信息.身份 / 与主角关系）—— 必须按卷分支重写 ══  共 ${桶.身份类.length} 处`);
for (const x of 桶.身份类.sort((a, b) => a.登场 - b.登场))
  console.log(`  登场${String(x.登场).padStart(4)} ${x.名.padEnd(10)} ${x.键.padEnd(6)} ${x.文.slice(0, 78)}`);

console.log(`\n══ 桶二：背景/关系/能力叙述类 —— 加章节段落控制即可 ══  共 ${桶.叙述类.length} 处`);
const 未判 = 桶.叙述类.filter(x => x.建议下界 === null);
console.log(`   其中已有人工下界判定: ${桶.叙述类.length - 未判.length}，待判定: ${未判.length}\n`);
for (const x of 桶.叙述类.sort((a, b) => a.登场 - b.登场))
  console.log(`  登场${String(x.登场).padStart(4)} ${x.名.padEnd(10)} [${x.节}] ${x.键.padEnd(10)} 下界=${x.建议下界 ?? '?'}  ${x.文.slice(0, 62)}`);

console.log(`\n══ 涉及角色（去重）${new Set(实务.map(r => r.名)).size} 人 ══`);
console.log([...new Set(实务.map(r => r.名))].join('、'));
fs.writeFileSync('src/兽血沸腾/tools/era-demote-plan.json',
  JSON.stringify({ 身份类: 桶.身份类, 叙述类: 桶.叙述类, 涉及: [...new Set(实务.map(r => r.名))] }, null, 2), 'utf8');
console.log('\n→ 已写 tools/era-demote-plan.json');
