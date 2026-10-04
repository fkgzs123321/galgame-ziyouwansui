import fs from 'fs';
const F4 = 'src/兽血沸腾/世界书/NPC/四殿下.yaml';
let t = fs.readFileSync(F4, 'utf8');
const before = t;
// 逐行处理：字段名 + 冒号 + 空白 + 前导标点(U+FF0C/半角逗号/U+3001/U+FF1B) → 只留空白
const LEAD = new Set(['\uFF0C', ',', '\u3001', '\uFF1B', ';']);
const out = t.split('\n').map(l => {
  const m = l.match(/^(\s{2}(?:说话风格|核心特质|整体印象|关系|态度|互动方式|性别|身份|姓名):\s*)(.*)$/);
  if (!m) return l;
  let rest = m[2];
  let changed = false;
  while (rest.length && LEAD.has(rest[0])) { rest = rest.slice(1).replace(/^\s+/, ''); changed = true; }
  return changed ? m[1] + rest : l;
}).join('\n');
fs.writeFileSync(F4, out, 'utf8');
console.log('修正:', out !== before);
console.log((out.match(/^  说话风格:.*$/m) || [''])[0].slice(0, 100));
