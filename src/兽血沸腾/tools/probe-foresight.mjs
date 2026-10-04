// 只读探针：基础信息 与 私密 是「无章节门控」的；性格调色盘 与 私密阶段 有 EJS 章节门控。
// 检测：基础信息的 背景设定 里有多少条描述的是「后期剧情结局」。
import fs from 'fs';
const R = 'src/兽血沸腾/世界书/角色';
const ROSTER = ['凝玉','艾薇尔','崔蓓茜','歌坦妮','若尔娜','黛丝','贞德','白素青','谭雅','阿仙奴','许德拉','歌莉妮','唐蓓尔金娜','梦露','嘉宝','艾莉婕'];

const block = (t, top) => {
  const ls = t.split('\n');
  const i = ls.findIndex(l => l.startsWith(top + ':'));
  if (i < 0) return [];
  const out = [];
  for (let j = i + 1; j < ls.length; j++) {
    if (/^\S/.test(ls[j]) && ls[j].trim()) break;
    const m = ls[j].match(/^ {2}([^\s:#][^:]*):\s*(.+)$/);
    if (m) out.push(m[1].trim());
  }
  return out;
};
// 后期事件词：出现即说明该条讲的是剧情后段
const 后期词 = /称王|加冕|登基|终战|决战|大结局|子嗣|太子|怀孕|生子|诞下|封神|统一|建国|立国|称帝|陨落|战死|阵亡|遗孀|晚年|归隐|王后|皇后|大祭司|红衣|神曲|遗忘历|改名|让位|退位/;

console.log('══ 每一类条目的门控情况 ══');
console.log('  基础信息    : 无 EJS 门控（按角色名激活，任何章节都注入全量）');
console.log('  性格调色盘  : 有 EJS 章节/好感门控（按阶段只注入当前档）');
console.log('  私密        : 无 EJS 门控（按角色名激活，任何章节都注入全量）');
console.log('  私密阶段    : 有 EJS 章节/好感门控（按阶段只注入当前档）\n');

console.log('══ 基础信息的 背景设定：条目数 与 疑似后期剧透条数 ══\n');
let tb = 0, tl = 0;
for (const n of ROSTER) {
  const t = fs.readFileSync(`${R}/${n}/基础信息.yaml`, 'utf8');
  const keys = block(t, '背景设定');
  const ls = t.split('\n');
  const 后期 = keys.filter(k => {
    const line = ls.find(l => new RegExp(`^ {2}${k}:`).test(l));
    return line && 后期词.test(line);
  });
  tb += keys.length; tl += 后期.length;
  console.log(`${n.padEnd(8)} 背景设定 ${String(keys.length).padStart(2)} 条，含后期词 ${String(后期.length).padStart(2)} 条${后期.length ? '  → ' + 后期.join('、') : ''}`);
}
console.log(`\n合计 背景设定 ${tb} 条，其中 ${tl} 条含后期事件词（占 ${(tl / tb * 100).toFixed(0)}%）`);
