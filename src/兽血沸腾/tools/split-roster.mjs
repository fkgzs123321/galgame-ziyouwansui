// 把 角色速览.yaml 拆成 9 个纪元分档的独立速览。
//
// 为什么用生成而不是手写：速览原本把「后为剑桥大祭师」这类终局态写进了 身份 字段，
// 与角色自己的分档条目互相矛盾。9 个文件手写会立刻漂移，且极易编造头衔。
// 这里改为**从角色自己的分档条目里把该纪元的 身份 渲染出来**——同一份文本，
// 单一事实来源，绝无编造，也不会与专条打架。
//
// 收录规则（宁可晚一档，不可提前泄漏）：
//   某个角色出现在第 N 档速览里，当且仅当 登场 <= 该档起点。
//   身份 取该档起点那一章渲染出来的值。
import fs from 'node:fs';
import path from 'node:path';
import { render } from './ejs-render.mjs';

const PROJ = 'src/兽血沸腾';
const 窗口 = [
  { 档: 1, 名: '荒岛篇', lo: 0, hi: 8 },
  { 档: 2, 名: '胸罩岛篇', lo: 9, hi: 20 },
  { 档: 3, 名: '海上篇', lo: 21, hi: 30 },
  { 档: 4, 名: '多瑙大荒原篇', lo: 31, hi: 42 },
  { 档: 5, 名: '博格村与领地初建', lo: 43, hi: 58 },
  { 档: 6, 名: '翡冷翠领主期', lo: 59, hi: 72 },
  { 档: 7, 名: '纵横篇·成长期', lo: 73, hi: 244 },
  { 档: 8, 名: '纵横篇·扩张期', lo: 245, hi: 704 },
  { 档: 9, 名: '纵横篇·终盘', lo: 705, hi: 763 },
];

const 速览 = fs.readFileSync(`${PROJ}/世界书/角色/角色速览.yaml`, 'utf8');
// 速览里每条是 - 姓名: X / 性别 / 年龄 / 身份 / 备注，抓成结构化行。
const 名录 = [];
{
  const 块 = 速览.split(/\n(?=\s*- 姓名:)/).slice(1);
  for (const b of 块) {
    const g = k => (b.match(new RegExp(`^\\s*(?:-\\s*)?${k}:\\s*(.+?)\\s*$`, 'm')) || [])[1] ?? '';
    const 名 = g('姓名');
    if (名) 名录.push({ 名, 性别: g('性别'), 年龄: g('年龄'), 备注: g('备注') });
  }
}

const era = JSON.parse(fs.readFileSync(`${PROJ}/tools/era-table.json`, 'utf8'));
const 登场 = new Map(era.表.map(r => [r.名, r.登场]));
// 速览里有个别名字与 era-table 的登记名不同，手工对齐（有原文依据，不是新造名）。
const 名对 = { '贝克汉姆': '贝克汉姆', '菲高': '菲高' };

function 找条目文件(名) {
  const a = `${PROJ}/世界书/角色/${名}/基础信息.yaml`;
  const b = `${PROJ}/世界书/NPC/${名}.yaml`;
  if (fs.existsSync(a)) return a;
  if (fs.existsSync(b)) return b;
  return null;
}

// 把渲染出的 YAML 文本里的 身份 值挖出来（结构有两层：角色档案.基本信息.身份 或 基本信息.身份）。
function 挖身份(文本) {
  const m = 文本.match(/^\s*身份:\s*(.+?)\s*$/m);
  return m ? m[1] : null;
}

// 备注 是原速览里的静态字段，脚本没法从角色专条重新渲染它，
// 于是「战死于滹夜古城」这类终局态会随备注一起漏进早期名册。
// 逐句检查，把含未来时态的句子整句去掉，别的话原样保留——只做减法，不添字。
const 未来句 = /后为|后任|后来|最终|结局|终成|升任|改任|继任|即位|称帝|追封|此后|日后|战死|阵亡|身亡|殉|牺牲|当上|被提为|新任|成为|成了|变成/;
function 清备注(备注) {
  if (!备注) return '';
  return 备注
    .split(/(?<=[，；、,;])/)
    .filter(句 => !未来句.test(句))
    .join('')
    .replace(/[，；、,;]\s*$/, '')
    .trim();
}

const 输出 = [];
const 未收录 = [], 无文件 = [], 渲染失败 = [];

for (const w of 窗口) {
  const 行 = [];
  for (const p of 名录) {
    const d = 登场.get(名对[p.名] ?? p.名);
    if (d === undefined) { if (!未收录.includes(p.名)) 未收录.push(p.名); continue; }
    if (d > w.lo) continue; // 该档起点还没登场
    const f = 找条目文件(p.名);
    if (!f) { if (!无文件.includes(p.名)) 无文件.push(p.名); continue; }
    let 身份 = null;
    身份 = null;
    try {
      const 原 = fs.readFileSync(f, 'utf8').replace(/^@@.*$/gm, '');
      const r = render(原, { 'stat_data.剧情.章节序号': w.lo });
      if (r.error) { 渲染失败.push(`${p.名}@${w.lo}: ${r.error}`); continue; }
      身份 = 挖身份(r.text);
    } catch (e) { 渲染失败.push(`${p.名}@${w.lo}: ${e.message}`); }
    if (!身份) { if (!渲染失败.includes(p.名)) 渲染失败.push(`${p.名}@${w.lo}: 无身份`); continue; }
    行.push({ 名: p.名, 性别: p.性别, 年龄: p.年龄, 身份, 备注: 清备注(p.备注) });
  }
  输出.push({ ...w, 行 });
}

// 写文件
const dir = `${PROJ}/世界书/角色/速览`;
fs.mkdirSync(dir, { recursive: true });
const 清单 = [];
for (const w of 输出) {
  const 名 = `${String(w.档).padStart(2, '0')}_${w.名}.yaml`;
  const L = [`${w.名}速览:`, `  章节区间: 第 ${w.lo} 至 ${w.hi} 章`, `  收录人数: ${w.行.length}`, `  名录:`];
  for (const r of w.行) {
    L.push(`    - 姓名: ${r.名}`);
    L.push(`      性别: ${r.性别}`);
    L.push(`      年龄: ${r.年龄}`);
    L.push(`      身份: ${r.身份}`);
    if (r.备注) L.push(`      备注: ${r.备注}`);
  }
  fs.writeFileSync(path.join(dir, 名), L.join('\n') + '\n', 'utf8');
  清单.push({ 文件: `世界书/角色/速览/${名}`, 档: w.档, 名: w.名, lo: w.lo, hi: w.hi, 人数: w.行.length });
}

console.log('── 各档人数 ──');
for (const c of 清单) console.log(`  ${c.档} ${c.名} [${c.lo}-${c.hi}]  ${c.人数} 人`);
console.log(`\n未在 era-table 登记：${未收录.length} ${未收录.join('、')}`);
console.log(`找不到条目文件：${无文件.length} ${无文件.join('、')}`);
if (渲染失败.length) console.log(`渲染问题 ${渲染失败.length}：\n  ${渲染失败.slice(0, 20).join('\n  ')}`);
fs.writeFileSync(`${PROJ}/tools/roster-split.json`, JSON.stringify({ 清单, 未收录, 无文件, 渲染失败 }, null, 1), 'utf8');
