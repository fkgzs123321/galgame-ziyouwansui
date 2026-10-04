// 桶一/桶二 只能往 Shape A（已有 contents @@if 门）的 基础信息.yaml 里加内联分支。
// 一个条目只能有一个装饰器 → 不能加 @@private → 不能用 const → 只能用内联 getvar()。
// 本探针查两件事：
//   ① 全库有没有「内联 getvar 写在 <%_ if (...) _%> 条件里」的先例；
//   ② 全库 <%_ %> 上方是否存在「同一文件里出现多个装饰器」的违规。
import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书';
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.yaml')) files.push(p);
  }
})(ROOT);

let 内联if = 0, const式 = 0, 多装饰器 = 0;
const 内联样本 = [], 多装饰器样本 = [];

for (const p of files) {
  const t = fs.readFileSync(p, 'utf8');
  const L = t.split('\n').map(s => s.replace(/\r$/, ''));
  // ① 内联 getvar 出现在 if/else if 条件里
  for (const ln of L) {
    if (/<%_?\s*(else\s+)?if\s*\(/.test(ln) && /getvar\s*\(/.test(ln)) {
      内联if++; if (内联样本.length < 6) 内联样本.push(`${p.replace(/\\/g,'/')}  ::  ${ln.trim()}`);
    }
    if (/<%_?\s*if\s*\(\s*[A-Za-z_$][\w$]*\s*[<>=!]/.test(ln)) const式++;
  }
  // ② 装饰器行数
  const dec = L.filter(s => /^@@(private|if|generate_before|generate_after|render_before|render_after)/.test(s));
  if (dec.length > 1) { 多装饰器++; 多装饰器样本.push(`${p.replace(/\\/g,'/')} :: ${dec.join(' | ')}`); }
}

console.log(`扫描 ${files.length} 个 yaml`);
console.log(`① 内联 getvar 直接写在 if 条件里: ${内联if} 处`);
for (const s of 内联样本) console.log('     ' + s);
console.log(`   （对照）用 const 局部名做条件: ${const式} 处`);
console.log(`② 单文件出现 >1 个装饰器: ${多装饰器} 处`);
for (const s of 多装饰器样本) console.log('     ' + s);
