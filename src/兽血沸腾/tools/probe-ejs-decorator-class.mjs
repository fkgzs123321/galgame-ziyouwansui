import fs from 'fs';
import path from 'path';
const root = 'src/兽血沸腾/世界书';
function walk(d) {
  const o = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) o.push(...walk(p));
    else if (e.name.endsWith('.yaml')) o.push(p);
  }
  return o;
}
let 有段落无装饰器 = [], 表 = {};
for (const p of walk(root)) {
  const t = fs.readFileSync(p, 'utf8');
  if (!/<%_\s*(if|else|const|for)/.test(t)) continue;
  const L1 = (t.split('\n')[0] || '').trim();
  const rel = path.relative(root, p).replace(/\\/g, '/');
  const dec = L1.startsWith('@@') ? L1.split(/\s+/)[0] : '(无装饰器)';
  表[dec] = (表[dec] || 0) + 1;
  // 段落控制里是否用到 chap（即依赖章节序号做分档）
  const 用chap = /<%_[^%]*\bchap\b/.test(t);
  if (!L1.startsWith('@@')) 有段落无装饰器.push(`${rel}  用chap=${用chap}`);
}
console.log('══ 含 <%_ %> 控制流的文件，按首行装饰器分类 ══');
for (const [k, v] of Object.entries(表).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(16)} ${v}`);
console.log(`\n首行无装饰器却有 <%_ %> 的文件: ${有段落无装饰器.length}`);
for (const x of 有段落无装饰器.slice(0, 20)) console.log('   ' + x);
