// 比对 schema.json 的叶子类型与 变量更新规则.yaml 里 type 段的声明。只读。
// 说明：
//  - 规则里的 `甲|乙|丙` 字面量联合，若 schema 是 string，视为等价（JSON Schema 用 enum 表达）。
//  - 规则里以 `{` 开头的多行块，是对象结构说明，对应 schema 的 object / $ref。
//  - 规则里 `${甲|乙}` 形式的模板键，展开后逐一比对。
import fs from 'fs';
import YAML from 'yaml';

const S = JSON.parse(fs.readFileSync('src/兽血沸腾/schema.json', 'utf8'));
const R = YAML.parse(
  fs.readFileSync('src/兽血沸腾/世界书/变量/变量更新规则.yaml', 'utf8'),
)['变量更新规则'];

// ── schema 叶子类型表（先解析 $ref）──
const defs = S.$defs || {};
const deref = o => {
  let cur = o;
  for (let i = 0; i < 10 && cur && cur.$ref; i++) {
    cur = defs[String(cur.$ref).replace('#/$defs/', '')];
  }
  return cur;
};
const T = {};
const sc = (raw, pre) => {
  const o = deref(raw);
  if (!o || typeof o !== 'object') return;
  if (o.properties) {
    for (const [k, v] of Object.entries(o.properties)) sc(v, pre ? `${pre}.${k}` : k);
  } else if (o.additionalProperties && typeof o.additionalProperties === 'object') {
    sc(o.additionalProperties, `${pre}.[]`);
  } else {
    T[pre] = o.type || (o.anyOf ? 'union' : '?');
  }
};
sc(S, '');

// ── 规则声明的 type ──
const decl = {};
const expand = (key, val, pre) => {
  // ${甲|乙|丙} 展开
  const m = key.match(/^\$\{(.+)\}$/);
  const keys = m ? m[1].split('|') : [key];
  for (const k of keys) {
    const p = pre ? `${pre}.${k}` : k;
    if (typeof val === 'string') decl[p] = val;
  }
};
const walk = (o, pre) => {
  for (const [k, v] of Object.entries(o || {})) {
    if (['check', 'format', 'range'].includes(k)) continue;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (k === 'type') continue;
      walk(v, pre ? `${pre}.${k}` : k);
    } else if (k === 'type' && typeof v === 'string') {
      decl[pre] = v;
    }
  }
  // 单独处理 type 键位于叶子的情况
  for (const [k, v] of Object.entries(o || {})) {
    if (k === 'type' && typeof v === 'string') decl[pre] = v;
  }
};
// 自顶向下：遇到 type 是字符串就把当前节点记下；否则递归；模板键展开
const rec = (o, pre) => {
  if (!o || typeof o !== 'object') return;
  if (typeof o.type === 'string') {
    expand(pre.split('.').pop(), o.type, pre.split('.').slice(0, -1).join('.'));
    return;
  }
  for (const [k, v] of Object.entries(o)) {
    if (['check', 'format', 'range'].includes(k)) continue;
    if (v && typeof v === 'object' && !Array.isArray(v)) rec(v, pre ? `${pre}.${k}` : k);
  }
};
rec(R, '');
void walk;

const 规范化 = s => {
  const t = String(s).trim();
  if (t.endsWith('[]')) return 'array';
  if (/^number/.test(t)) return 'number';
  if (/^boolean/.test(t)) return 'boolean';
  if (/^string/.test(t)) return 'string';
  if (t.startsWith('{') || /^Array/.test(t)) return 'object';
  if (t.includes('|')) return 'string'; // 字面量联合
  return 'literal';
};

const 兼容 = (a, b) =>
  a === b ||
  b === 'union' || // zod 开关：boolean | string
  (a === 'literal' && b === 'string') ||
  (a === 'object' && ['object', '?'].includes(b));

// 规则里既有 type 也有 format 的节点，都算已声明
const 已说明 = new Set(Object.keys(decl));
// 只有 check 的节点也算已说明（string 类型可省略 type，见 update-rules-guide.md L23）
const recOther = (o, pre) => {
  if (!o || typeof o !== 'object') return;
  if (pre && (typeof o.format === 'string' || o.check)) 已说明.add(pre);
  for (const [k, v] of Object.entries(o)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) recOther(v, pre ? `${pre}.${k}` : k);
  }
};
recOther(R, '');
// `X: string;` 这种扁平写法
for (const [p, t] of Object.entries(decl)) {
  const parent = p.split('.').slice(0, -1).join('.');
  if (parent) 已说明.add(parent);
}

let 不一致 = 0;
console.log('── schema 与规则 type 冲突 ──');
for (const [k, rv] of Object.entries(decl)) {
  const st = T[k];
  if (st === undefined) continue;
  if (!兼容(规范化(rv), st)) {
    console.log(`  ${k}\n      schema=${st}   规则=${String(rv).slice(0, 46)}`);
    不一致++;
  }
}
if (!不一致) console.log('  无');

// 父节点被声明为对象块的，其子叶子视为已覆盖
const 父已述 = k => {
  const ps = k.split('.');
  for (let i = ps.length - 1; i > 0; i--) {
    const p = ps.slice(0, i).join('.');
    if (decl[p] && 规范化(decl[p]) === 'object') return true;
  }
  return false;
};

console.log('\n── schema 里是标量、规则未声明 type ──');
let 未 = 0;
for (const [k, v] of Object.entries(T)) {
  if (k.includes('.[]')) continue;
  if (!['string', 'number', 'boolean'].includes(v)) continue;
  if (已说明.has(k) || 父已述(k)) continue;
  console.log(`  ${k}  (schema=${v})`);
  未++;
}
if (!未) console.log('  无');

console.log(`\n叶子 ${Object.keys(T).length}，规则声明 ${Object.keys(decl).length}，冲突 ${不一致}`);
