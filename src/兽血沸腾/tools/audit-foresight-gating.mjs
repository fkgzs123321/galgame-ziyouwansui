import fs from 'fs';
import path from 'path';
const ROOT = 'src/兽血沸腾';
const s = JSON.parse(fs.readFileSync(`${ROOT}/tavern-cards-state.json`, 'utf8'));
const M = s.entryManifest;
const resolve = v => {
  const f = v.path ?? v.contents?.find(c => c.file)?.file;
  return f ? path.join(ROOT, f) : null;
};
const firstLine = v => {
  const p = resolve(v);
  if (!p || !fs.existsSync(p)) return '(缺失)';
  return fs.readFileSync(p, 'utf8').split('\n')[0];
};

console.log('══ 时间线 plot（10 条）—— 是否带 @@if 章节门控 ══\n');
for (const [k, v] of Object.entries(M['时间线'] ?? {})) {
  if (v.part !== 'plot') continue;
  const l1 = firstLine(v);
  const tag = /^@@if/.test(l1) ? '✓ 有门控' : '✗ 无门控';
  console.log(`  ${tag}  ${k.padEnd(22)} ${v.strategy?.type.padEnd(10)} ${l1.slice(0, 58)}`);
}

console.log('\n══ 事件（48 条）—— 是否带 @@if 章节门控 ══\n');
let g = 0; const bad = [];
for (const [k, v] of Object.entries(M['事件'] ?? {})) {
  const l1 = firstLine(v);
  if (/^@@if/.test(l1)) g++; else bad.push(`${k.padEnd(28)} ${l1.slice(0, 52)}`);
}
console.log(`  有门控 ${g} / 无门控 ${bad.length}（共 ${g + bad.length}）`);
bad.forEach(b => console.log('    ✗ ' + b));

console.log('\n══ 时间线 history（26 条）—— 是否带 @@if ══\n');
let hg = 0; const hbad = [];
for (const [k, v] of Object.entries(M['时间线'] ?? {})) {
  if (v.part !== 'history') continue;
  const l1 = firstLine(v);
  if (/^@@if/.test(l1)) hg++; else hbad.push(k);
}
console.log(`  有门控 ${hg} / 无门控 ${hbad.length}`);
if (hbad.length) console.log('    ' + hbad.join('、'));
