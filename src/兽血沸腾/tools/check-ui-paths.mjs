import fs from 'fs';
import path from 'path';

const schema = JSON.parse(fs.readFileSync('src/兽血沸腾/schema.json', 'utf8'));
const top = schema.properties || {};
const TOP_KEYS = new Set(Object.keys(top));

const DIR = 'src/兽血沸腾/界面';
const files = [];
(function rec(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) rec(path.join(d, e.name));
    else if (/\.(vue|ts)$/.test(e.name)) files.push(path.join(d, e.name));
  }
})(DIR);

// 在 schema 里查找顶层键下的子键（1 层 + record 通配）
function children(key) {
  const n = top[key];
  if (!n) return null;
  const out = new Set();
  const scan = node => {
    if (!node || typeof node !== 'object') return;
    for (const k of Object.keys(node.properties || {})) out.add(k);
    if (node.additionalProperties && typeof node.additionalProperties === 'object') {
      out.add('*');
      scan(node.additionalProperties);
    }
    for (const k of ['anyOf', 'oneOf', 'allOf']) if (Array.isArray(node[k])) node[k].forEach(scan);
  };
  scan(n);
  return out;
}

console.log('=== 各面板引用的顶层键与二级键覆盖情况 ===\n');
let problems = 0;
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const rel = path.relative(DIR, f).replace(/\\/g, '/');

  // 找所有 X.Y 形式，其中 X 是 schema 顶层键
  const found = new Map(); // topkey -> Set(subkeys)
  for (const m of t.matchAll(/([A-Za-z\u4e00-\u9fa5_$]+)\.([A-Za-z\u4e00-\u9fa5_$]+)/g)) {
    const [, a, b] = m;
    if (!TOP_KEYS.has(a)) continue;
    if (!found.has(a)) found.set(a, new Set());
    found.get(a).add(b);
  }
  if (!found.size) continue;

  const msgs = [];
  for (const [k, subs] of found) {
    const ch = children(k);
    for (const s of subs) {
      if (s === 'length' || s === 'map' || s === 'filter' || s === 'some' || s === 'value' || s === 'name') continue;
      if (!ch.has(s) && !ch.has('*')) msgs.push(`  ✗ ${k}.${s} 不在 schema`);
      else if (!ch.has(s) && ch.has('*')) { /* 通配，合法 */ }
    }
  }
  if (msgs.length) {
    problems += msgs.length;
    console.log(rel);
    msgs.forEach(m => console.log(m));
    console.log('');
  }
}
console.log(problems ? `共 ${problems} 处疑似路径错误` : '全部面板/表单的二级键引用均存在于 schema');
