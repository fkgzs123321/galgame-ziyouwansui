// EJS 段落控制渲染器 —— 全校验/探针工具的唯一实现。
// 之所以抽成模块：check-ejs.mjs 与临时探针曾经各写一份，两边对
// `} else if (...)` 的处理不一致（探针把 else-if 当成独立的 if 入栈，
// 不继承兄弟分支的 taken 状态），于是同一个文件在校验器里通过、在探针里
// 只渲染出前 8 行。分档内容全靠这个渲染器判定，绝不能再有两份实现。
import fs from 'node:fs';
import path from 'node:path';

export const VOLS = ['荒岛篇', '胸罩岛篇', '海上篇', '多瑙大荒原篇', '博格村与领地初建', '翡冷翠领主期', '比蒙王国纵横'];
export const AFFS = [0, 10, 19, 20, 35, 49, 50, 65, 79, 80, 95, 100];
export const LOYS = [0, 20, 39, 40, 55, 69, 70, 85, 100];
export const CHAPS = [0, 1, 5, 12, 25, 40, 60, 72, 73, 100, 200, 300, 400, 500, 600, 700, 763];

// 变量名 → 取值集合。按后缀匹配，覆盖 好感度 / 忠诚 / 当前卷 / 章节序号 四类。
export function valsFor(varKey) {
  const leaf = varKey.split('.').pop();
  if (leaf === '好感度') return AFFS;
  if (leaf === '忠诚') return LOYS;
  if (leaf === '当前卷') return VOLS;
  if (leaf === '章节序号') return CHAPS;
  return null;
}

export const evalIn = (code, consts) => Function('__c', `with(__c){ return (${code}); }`)(consts);

// 解释 @@private + <%_ %> 控制流，返回当前分支下的输出文本
export function render(text, vars) {
  const consts = Object.create(null);
  const body = text.replace(
    /<%_\s*const\s+(\w+)\s*=\s*getvar\(\s*'([^']+)'\s*(?:,[^)]*)?\)\s*;\s*_%>/g,
    (m, name, key) => {
      consts[name] = vars[key];
      return '<%_ __ASSIGN__ _%>';
    },
  );

  const out = [];
  const stack = [];
  const active = () => stack.every(f => f.active);

  for (const line of body.split(/\r?\n/)) {
    const ctrl = line.match(/^\s*<%_\s*(.*?)\s*_%>\s*$/);
    if (!ctrl) {
      if (active()) out.push(line);
      continue;
    }
    const code = ctrl[1];
    if (code === '__ASSIGN__') continue;
    if (code === '}') {
      stack.pop();
      continue;
    }
    // 统计本行关闭了几层控制块。不能直接数 `}`：内联写法
    // `} else if (getvar('…', { defaults: 0 }) >= 48) {` 里的 `{ defaults: 0 }`
    // 自带一个 `}`，会被误当成多关了一层，导致各分支同时激活、渲染出重复键。
    // 先把括号组（getvar 的实参就在这里）折叠掉，只留下真正的块级花括号。
    const closes = (code.replace(/\([^()]*\)/g, '()').match(/\}/g) || []).length;
    let prev = null;
    for (let i = 0; i < closes; i++) prev = stack.pop();
    let cond = null;
    let isElse = false;
    const ifm = code.match(/if\s*\((.*)\)\s*\{?\s*$/);
    if (ifm) {
      let expr = ifm[1].replace(/getvar\(\s*'([^']+)'\s*(?:,[^)]*)?\)/g, (m, key) => JSON.stringify(vars[key]));
      for (const [k, v] of Object.entries(consts)) {
        expr = expr.replace(new RegExp(`\\b${k}\\b`, 'g'), JSON.stringify(v));
      }
      cond = evalIn(expr, consts);
    } else if (/\belse\b/.test(code)) {
      isElse = true;
    } else {
      return { error: `无法识别的控制行: ${code}` };
    }
    const parentActive = active();
    if (isElse) {
      if (!prev) return { error: `else 没有对应的 if: ${code}` };
      stack.push({ active: parentActive && !prev.taken, taken: true });
    } else {
      const chainTaken = prev ? prev.taken : false;
      const take = parentActive && !chainTaken && !!cond;
      stack.push({ active: take, taken: chainTaken || take });
    }
  }
  if (stack.length) return { error: `控制块未闭合，残留 ${stack.length} 层` };
  return { text: out.join('\n') };
}

// ── 递归收集所有 yaml ──
export function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.yaml')) out.push(p);
  }
  return out;
}
