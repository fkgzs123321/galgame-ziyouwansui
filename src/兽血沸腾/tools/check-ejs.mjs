// 校验 EJS 世界书条目：自动发现所有 @@ 开头的条目，对每个分支取值渲染后做 YAML 解析。
// 旧版把非事件条目硬编码在 CASES 里，新增的调色盘从未被真正渲染过，
// 因此这里改为按第二行的 getvar 路径自动推断取值集合。
// 事件条目按 stat_data.剧情.章节序号 的数值窗口显隐，顺带检查窗口是否无缝覆盖 0~763。
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { VOLS, AFFS, LOYS, CHAPS, valsFor, render, walk } from './ejs-render.mjs';

const root = 'src/兽血沸腾/世界书';

let fail = 0;

// 渲染结果里出现重复键会让 YAML.parse 抛错，但它不报键名，这里自行定位。
// 必须按完整路径判重：不同父节点下同名子键（如多个关键节点各有「触发」）是合法的。
function findDupKeys(text) {
  const seen = new Set();
  const dups = [];
  const stack = []; // { indent, key }
  for (const line of text.split('\n')) {
    const m = line.match(/^(\s*)([^\s#:][^:]*?)\s*:(?:\s|$)/);
    if (!m) continue;
    const indent = m[1].length;
    const key = m[2].trim();
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    const pathKey = [...stack.map(s => s.key), key].join('.');
    if (seen.has(pathKey)) dups.push(pathKey);
    else seen.add(pathKey);
    stack.push({ indent, key });
  }
  return [...new Set(dups)];
}

function check(rel, defs, { 有外门 = false, 有包装 = false } = {}) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return { skip: true };
  const raw = fs.readFileSync(p, 'utf8');
  // 装饰器可以来自两处：文件首行的 @@xxx，或 entryManifest 的 contents 首片段 @@if。
  // 后者只有「条目显隐」一种用途（conventions.md L210），因此不要求文件以 @@ 开头。
  // 另外 XML 包装的条目（contents 首片段是 `---\n<character_basic ...>`）同样不以 @@
  // 开头，且完全没有装饰器，正文里的段落控制靠内联 getvar 实现，也不能要求 @@。
  if (!有外门 && !有包装 && !raw.startsWith('@@')) {
    console.log(`FAIL ${rel}: @@ 必须是文件首行`);
    fail++;
    return {};
  }
  const firstTwo = raw.split('\n').slice(0, 2);
  if (!有外门 && !有包装 && firstTwo.length === 2 && firstTwo[1].trim() === '') {
    console.log(`FAIL ${rel}: 装饰器与内容之间不允许空行`);
    fail++;
  }
  const body = raw.replace(/^@@(private|if|generate_before|generate_after|render_before|render_after)[^\n]*\n/, '');
  let combos = [{}];
  for (const [key, vals] of defs) {
    const next = [];
    for (const c of combos) for (const v of vals) next.push({ ...c, [key]: v });
    combos = next;
  }
  let ok = 0;
  let empties = 0;
  const shapes = new Map();
  for (const vars of combos) {
    const r = render(body, vars);
    if (r.error) {
      console.log(`FAIL ${rel} @${JSON.stringify(vars)}: ${r.error}`);
      fail++;
      continue;
    }
    const t = r.text.replace(/^@@\w+.*$/gm, '');
    if (!t.trim()) {
      empties++;
      continue;
    }
    const dups = findDupKeys(t);
    if (dups.length) {
      console.log(`FAIL ${rel} @${JSON.stringify(vars)}: 渲染结果键重复 -> ${dups.join(', ')}`);
      fail++;
      continue;
    }
    try {
      const parsed = YAML.parse(t);
      const keys = Object.keys(parsed ?? {}).join(',');
      if (!shapes.has(keys)) shapes.set(keys, []);
      shapes.get(keys).push(JSON.stringify(vars));
      ok++;
    } catch (e) {
      console.log(`FAIL ${rel} @${JSON.stringify(vars)}: ${e.message.split('\n')[0]}`);
      fail++;
    }
  }
  if (!ok) {
    console.log(`FAIL ${rel}: 没有任何取值能渲染出内容`);
    fail++;
    return {};
  }
  console.log(`OK  ${rel}: 渲染 ${ok}/${combos.length} 例通过，空分支 ${empties}，形状 ${shapes.size} 种`);
  for (const [keys, vars] of shapes) {
    const list = keys.split(',');
    const shown = list.length > 8 ? `${list.slice(0, 6).join(',')},…,${list[list.length - 1]} (共 ${list.length})` : keys;
    console.log(`      [${shown}] ← ${vars.slice(0, 3).join(' ')}${vars.length > 3 ? ` …共${vars.length}` : ''}`);
  }
  return { ok };
}

// ── 自动发现全部 EJS 条目 ──
// 两类来源：
//   1. 磁盘文件首行是 @@ 的条目（原有逻辑）；
//   2. 条目显隐门写在 entryManifest 的 contents 首片段里的条目 —— 这类文件本身不以 @@
//      开头，check-yaml 也不会跳过它，但它的正文里同样可能有 <%_ %> 段落控制，
//      必须一并渲染校验，否则「硬登场门 + 段落控制」的组合无人把关。
const all = walk(root);
const NON_EVENT = [];
const EVENTS = [];
const WINDOWS = [];

// ── 收集 contents 门 ──
const 片段门 = new Map(); // rel → 门行（首片段是 @@if 的）
// 另一类：contents 里有 file 片段、但首片段不是 @@if（例如 XML 包装的 基础信息）。
// 这类条目本身没有任何装饰器，却完全可以在正文里写 <%_ %> 段落控制，
// 之前因为「文件首行不是 @@、也没有门」而被整条漏掉，导致主角这类无登场门的
// 角色档案的段落控制从未被渲染校验。必须一并纳入。
const 无门片段 = new Set();
try {
  const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
  for (const 类型 of Object.keys(st.entryManifest ?? {})) {
    for (const leaf of Object.values(st.entryManifest[类型] ?? {})) {
      if (!leaf || typeof leaf !== 'object') continue;
      const f = (leaf.contents || []).find(c => c.file)?.file;
      if (!f) continue;
      // file 形如 世界书/角色/xx/基础信息.yaml → 相对 root 的 世界书
      const rel = f.replace(/^世界书\//, '').replace(/\\/g, '/');
      const first = (leaf.contents || [])[0];
      if (first?.content && first.content.trim().startsWith('@@if ')) {
        if (!片段门.has(rel)) 片段门.set(rel, first.content.trim());
      } else {
        无门片段.add(rel);
      }
    }
  }
} catch (e) {
  console.log(`WARN 读取 tavern-cards-state.json 失败，contents 门不会被校验: ${e.message}`);
}
console.log(`已登记 contents 门 ${片段门.size} 个，无门 contents 条目 ${无门片段.size} 个`);

// 门行 → 取值集合（登场门只写 >= N，语料同 check() 的窗口推断）
function 门取值(门行) {
  const ges = [...门行.matchAll(/>=\s*(\d+)/g)].map(m => Number(m[1]));
  const les = [...门行.matchAll(/<=\s*(\d+)/g)].map(m => Number(m[1]));
  if (门行.includes('章节序号') && ges.length) {
    const lo = Math.min(...ges), hi = les.length ? Math.max(...les) : 763;
    const vals = [...new Set([lo - 1, lo, Math.floor((lo + hi) / 2), hi, hi + 1])].filter(v => v >= 0 && v <= 763);
    return [['stat_data.剧情.章节序号', vals]];
  }
  return [['stat_data.剧情.当前卷', VOLS]];
}

for (const p of all) {
  const rel = path.relative(root, p).replace(/\\/g, '/');
  if (rel.startsWith('事件/')) continue; // 事件条目单独处理
  const raw = fs.readFileSync(p, 'utf8');
  const 门行 = 片段门.get(rel);
  const 有包装 = 无门片段.has(rel);
  // 无门且无装饰器的包装条目，只有正文里真的写了段落控制才需要校验；否则纯 YAML
  // 条目会灌满输出、淹没真正的失败。
  if (!raw.startsWith('@@') && !门行 && !(有包装 && raw.includes('<%_'))) continue;
  const lines = raw.split('\n');
  // 头部可能声明多个 const（既有 aff 又有 chap）。只取第一个会漏掉章节轴，
  // 导致新加的登场门在全部取值下都是 false，被误报成「没有任何取值能渲染出内容」。
  // 因此扫描整个文件的 getvar 调用，把所有已知变量都纳入取值组合。
  // （不能只看前 8 行：Shape A 的 基础信息 没有 const 头，第一处内联 getvar
  //   可能落在第 8 行之后，只看头部会漏掉章节轴。）
  const keys = [...raw.matchAll(/getvar\(\s*'([^']+)'/g)].map(m => m[1]);
  const 已知 = [...new Set(keys)].filter(k => valsFor(k));
  let defs;
  if (已知.length) {
    defs = 已知.map(k => [k, valsFor(k)]);
    // 有外部登场门时，把门也纳入取值轴，确保「未登场」分支被渲染到
    if (门行) for (const [k, v] of 门取值(门行)) if (!defs.some(d => d[0] === k)) defs.push([k, v]);
  } else {
    // 头部没有已知变量：优先用 contents 门，其次从 @@if 行推章节窗口
    const first = raw.startsWith('@@') ? lines[0] : (门行 ?? '');
    const ges = [...first.matchAll(/>=\s*(\d+)/g)].map(m => Number(m[1]));
    const les = [...first.matchAll(/<=\s*(\d+)/g)].map(m => Number(m[1]));
    // 登场门只写 `>= N`（章节序号只增不减），窗口写 `>= lo && <= hi`。
    // 没有上界时按 763 兜底，否则取不到「已登场」的取值，条目会被误判为渲染不出内容。
    if (first.includes('章节序号') && ges.length) {
      const lo = Math.min(...ges), hi = les.length ? Math.max(...les) : 763;
      const vals = [...new Set([lo - 1, lo, Math.floor((lo + hi) / 2), hi, hi + 1])].filter(v => v >= 0 && v <= 763);
      defs = [['stat_data.剧情.章节序号', vals]];
    } else {
      defs = [['stat_data.剧情.当前卷', VOLS]];
    }
  }
  // 段落控制里的分档边界（chap >= N / chap < N）未必落在 CHAPS 采样点上，
  // 补上 N 与 N-1，保证「刚好登场」和「登场前一天」两个关键取值都会被渲染到。
  // 两种写法都要认：@@private 文件里的局部短名 `chap >= N`，
  // 以及 Shape A 文件（已有 contents 门、不能再加第二个装饰器）里的内联
  // `getvar('stat_data.剧情.章节序号', { defaults: 0 }) >= N`。
  const 边界 = new Set();
  for (const m of raw.matchAll(/(?:chap|章节序号'[^)]*\))\s*(?:>=|>|<|<=)\s*(\d+)/g)) {
    const n = Number(m[1]);
    边界.add(n); 边界.add(n - 1);
  }
  for (const m of raw.matchAll(/(?:aff|好感度'[^)]*\))\s*(?:>=|>|<|<=)\s*(\d+)/g)) {
    const n = Number(m[1]);
    边界.add(n); 边界.add(n - 1);
  }
  defs = defs.map(([k, vals]) => {
    const leaf = k.split('.').pop();
    if (leaf !== '章节序号' && leaf !== '好感度') return [k, vals];
    const extra = [...边界].filter(v => v >= 0 && v <= 763 && !vals.includes(v));
    return [k, [...vals, ...extra].sort((a, b) => a - b)];
  });

  NON_EVENT.push({ rel, defs, 有外门: !!门行, 有包装 });
}

// ── 自动发现事件条目 ──
const evDir = path.join(root, '事件');
if (fs.existsSync(evDir)) {
  for (const f of fs.readdirSync(evDir)) {
    if (!f.endsWith('.yaml')) continue;
    const rel = `事件/${f}`;
    const raw = fs.readFileSync(path.join(root, rel), 'utf8');
    const first = raw.split('\n')[0];
    if (!first.startsWith('@@')) {
      console.log(`FAIL ${rel}: @@ 必须是文件首行`);
      fail++;
      continue;
    }
    const ges = [...first.matchAll(/>=\s*(\d+)/g)].map(m => Number(m[1]));
    const les = [...first.matchAll(/<=\s*(\d+)/g)].map(m => Number(m[1]));
    if (first.includes('章节序号') && ges.length && les.length) {
      const lo = Math.min(...ges);
      const hi = Math.max(...les);
      if (lo > hi) {
        console.log(`FAIL ${rel}: 窗口下界 ${lo} 大于上界 ${hi}`);
        fail++;
      }
      WINDOWS.push({ rel, lo, hi });
      const vals = [...new Set([lo - 1, lo, Math.floor((lo + hi) / 2), hi, hi + 1])].filter(v => v >= 0 && v <= 763);
      EVENTS.push({ rel, defs: [['stat_data.剧情.章节序号', vals]] });
    } else if (first.includes('当前卷')) {
      EVENTS.push({ rel, defs: [['stat_data.剧情.当前卷', VOLS]] });
    } else {
      EVENTS.push({ rel, defs: [['stat_data.剧情.章节序号', CHAPS]] });
    }
  }
}

console.log(`── 非事件 EJS 条目（自动发现 ${NON_EVENT.length} 个，其中 ${NON_EVENT.filter(e => e.有外门).length} 个为 contents 门）──`);
for (const { rel, defs, 有外门, 有包装 } of NON_EVENT) check(rel, defs, { 有外门, 有包装 });

console.log(`\n── 事件条目（自动发现 ${EVENTS.length} 个，按章节序号窗口）──`);
for (const e of EVENTS) check(e.rel, e.defs);

// ── 窗口无缝覆盖检查 ──
if (WINDOWS.length) {
  console.log('\n── 事件窗口覆盖 ──');
  const sorted = [...WINDOWS].sort((a, b) => a.lo - b.lo);
  const gaps = [];
  const overlaps = [];
  let prev = -1;
  for (const w of sorted) {
    if (w.lo > prev + 1) gaps.push(`${prev + 1}~${w.lo - 1}（在 ${w.rel} 之前）`);
    if (w.lo <= prev) overlaps.push(`${w.rel} 的 ${w.lo} 落在前一窗口内`);
    prev = Math.max(prev, w.hi);
  }
  console.log(`窗口 ${WINDOWS.length} 个，覆盖 0~${prev}`);
  if (gaps.length) {
    console.log(`FAIL 覆盖缺口 ${gaps.length} 处: ${gaps.slice(0, 5).join(' | ')}`);
    fail++;
  } else console.log('OK  无覆盖缺口');
  if (overlaps.length) {
    console.log(`FAIL 窗口重叠 ${overlaps.length} 处: ${overlaps.slice(0, 5).join(' | ')}`);
    fail++;
  } else console.log('OK  无窗口重叠');
  if (prev !== 763) {
    const EXPECTED = 48;
    if (WINDOWS.length >= EXPECTED) {
      console.log(`FAIL 覆盖终点为 ${prev}，应为 763`);
      fail++;
    } else {
      console.log(`PENDING 覆盖 0~${prev}，事件条目 ${WINDOWS.length}/${EXPECTED}，待补齐至 763`);
    }
  }
}

console.log(fail === 0 ? '\nEJS 全部通过' : `\nEJS 失败 ${fail} 例`);
process.exitCode = fail === 0 ? 0 : 1;
