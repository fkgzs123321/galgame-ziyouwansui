// 重建「按文件」的降格工作队列。
// era-demote-plan.json 的条目只有 {名,登场,节,键,文,建议下界}，没有文件定位，
// 所以早先按 it.键 分组的探针全部打出 undefined。这里改用「文」原文去全库反查文件与行号。
import fs from 'fs';
import path from 'path';

const PROJ = 'src/兽血沸腾';
const plan = JSON.parse(fs.readFileSync(`${PROJ}/tools/era-demote-plan.json`, 'utf8'));

// 收集全部候选文件
const cands = [];
for (const base of ['世界书/角色', '世界书/NPC']) {
  const d = `${PROJ}/${base}`;
  if (!fs.existsSync(d)) continue;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) {
      for (const f of fs.readdirSync(path.join(d, e.name)))
        if (f.endsWith('.yaml')) cands.push(`${base}/${e.name}/${f}`);
    } else if (e.name.endsWith('.yaml')) cands.push(`${base}/${e.name}`);
  }
}

const 缓存 = new Map();
for (const f of cands) 缓存.set(f, fs.readFileSync(`${PROJ}/${f}`, 'utf8').split('\n').map(s => s.replace(/\r$/, '')));

function 定位(文) {
  const 干 = 文.trim();
  const 命中 = [];
  for (const [f, L] of 缓存) {
    for (let i = 0; i < L.length; i++) {
      // 字段值可能被 YAML 引号包裹，用包含匹配
      if (L[i].includes(干)) { 命中.push([f, i + 1]); break; }
    }
  }
  return 命中;
}

const 队列 = [];
let 未定位 = [];
for (const [桶, arr] of [['身份类', plan.身份类], ['叙述类', plan.叙述类]]) {
  for (const it of arr) {
    const 命中 = 定位(it.文);
    if (命中.length === 0) { 未定位.push(`${桶} ${it.名} ${it.键}`); continue; }
    // 优先同一人物目录
    const 首 = 命中.find(([f]) => f.includes(`/${it.名}/`)) ?? 命中[0];
    队列.push({
      桶, 名: it.名, 登场: it.登场, 节: it.节, 键: it.键,
      建议下界: it.建议下界 ?? null, 文: it.文,
      文件: 首[0], 行: 首[1], 命中数: 命中.length,
    });
  }
}

队列.sort((a, b) => a.文件.localeCompare(b.文件) || a.行 - b.行);
fs.writeFileSync(`${PROJ}/tools/demote-queue.json`, JSON.stringify(队列, null, 1), 'utf8');

const 按文件 = new Map();
for (const q of 队列) {
  if (!按文件.has(q.文件)) 按文件.set(q.文件, []);
  按文件.get(q.文件).push(q);
}

console.log(`定位成功 ${队列.length} / ${队列.length + 未定位.length}`);
console.log(`涉及文件 ${按文件.size} 个`);
console.log(`身份类 ${队列.filter(q => q.桶 === '身份类').length} · 叙述类 ${队列.filter(q => q.桶 === '叙述类').length}`);
console.log(`建议下界 有值 ${队列.filter(q => q.建议下界 != null).length} / 为空 ${队列.filter(q => q.建议下界 == null).length}`);
if (未定位.length) { console.log(`\n未定位 ${未定位.length}:`); for (const x of 未定位) console.log('   - ' + x); }

console.log('\n══ 每文件处数（前 30）══');
const 排 = [...按文件.entries()].sort((a, b) => b[1].length - a[1].length);
for (const [f, arr] of 排.slice(0, 30)) console.log(`  ${String(arr.length).padStart(3)}  ${f}`);
