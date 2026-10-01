// 段落控制渲染探针（人工核对用）：node probe-render3.mjs <相对世界书路径> <章节序号> [好感度]
// 直接复用 ejs-render.mjs，与 check-ejs.mjs 完全同一套语义，避免两份实现走偏。
import fs from 'node:fs';
import path from 'node:path';
import { render } from './ejs-render.mjs';

const root = 'src/兽血沸腾/世界书';
const rel = process.argv[2];
const chap = Number(process.argv[3] ?? 0);
const aff = Number(process.argv[4] ?? 0);
const raw = fs.readFileSync(path.join(root, rel), 'utf8');

// 收集文件里出现的所有 getvar 键，给出取值
const vars = {};
for (const m of raw.matchAll(/getvar\(\s*'([^']+)'/g)) {
  const k = m[1];
  if (k in vars) continue;
  vars[k] = k.endsWith('章节序号') ? chap : k.endsWith('好感度') ? aff : 0;
}

const r = render(raw, vars);
if (r.error) { console.log(`ERROR ${r.error}`); process.exit(1); }
const lines = r.text.split('\n');
console.log(`════ ${rel}  chap=${chap} aff=${aff} ════`);
lines.forEach((L, i) => { if (L.trim()) console.log(L); });
