// 只读：角色条目的 strategy 分布、是否已有章节门控、基础信息的字段清单。
import fs from 'fs';
import path from 'path';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const M = st.entryManifest.角色;

// —— strategy 分布 ——
const dist = {};
for (const [k, v] of Object.entries(M)) {
  const s = v.strategy ? v.strategy.type : '(无)';
  dist[s] = (dist[s] || 0) + 1;
}
console.log('══ 角色条目 strategy 分布（共 ' + Object.keys(M).length + ' 条）══');
for (const [k, n] of Object.entries(dist).sort((a, b) => b[1] - a[1])) console.log(`   ${k.padEnd(14)} ${n}`);

// 看一条样例，确认字段形状
const 例 = Object.entries(M)[0];
console.log(`\n══ 样例 ${例[0]} ══`);
console.log('   ' + JSON.stringify({ ...例[1], contents: 例[1].contents ? '[…]' : undefined }, null, 0).slice(0, 400));
console.log('   strategy = ' + JSON.stringify(例[1].strategy));

// —— 已有门控的条目 ——
let 有门 = 0; const 门名 = [];
for (const [k, v] of Object.entries(M)) {
  const c = JSON.stringify(v.contents ?? '');
  if (/@@if|getvar/.test(c + JSON.stringify(v.path ?? ''))) { 有门++; 门名.push(k); }
}
console.log(`\n══ contents/path 里已含 @@if 或 getvar 的角色条目：${有门} ══`);
if (门名.length) console.log('   ' + 门名.slice(0, 12).join('、'));

// —— 基础信息 字段清单 ——
const DIR = 'src/兽血沸腾/世界书/角色';
const 顶层 = {}, 子 = {};
let 有门控文本 = 0; const 门控例 = [];
for (const d of fs.readdirSync(DIR, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const p = path.join(DIR, d.name, '基础信息.yaml');
  if (!fs.existsSync(p)) continue;
  const t = fs.readFileSync(p, 'utf8');
  if (/<%_|@@if/.test(t)) { 有门控文本++; if (门控例.length < 5) 门控例.push(d.name); }
  let cur = null;
  for (const l of t.split('\n')) {
    const m1 = l.match(/^([\u4e00-\u9fa5]{2,8}):\s*$/);
    if (m1) { cur = m1[1]; 顶层[cur] = (顶层[cur] || 0) + 1; continue; }
    const m2 = l.match(/^  ([\u4e00-\u9fa5]{2,10}):/);
    if (m2 && cur) 子[cur + '.' + m2[1]] = (子[cur + '.' + m2[1]] || 0) + 1;
  }
}
console.log('\n══ 基础信息.yaml 顶层字段出现次数 ══');
for (const [k, n] of Object.entries(顶层).sort((a, b) => b[1] - a[1])) console.log(`   ${k.padEnd(12)} ${n}`);
console.log('\n══ 基础信息.yaml 里的 基本信息.* 子字段 ══');
for (const [k, n] of Object.entries(子).filter(([k]) => k.startsWith('基本信息.')).sort((a, b) => b[1] - a[1])) console.log(`   ${k.padEnd(24)} ${n}`);
console.log('\n══ 关系设定.* 子字段样本 ══');
console.log('   ' + Object.keys(子).filter(k => k.startsWith('关系设定.')).slice(0, 30).join('、'));
console.log(`\n══ 基础信息.yaml 里已经写有 EJS 门控的：${有门控文本} 个 ══ ${门控例.join('、')}`);
