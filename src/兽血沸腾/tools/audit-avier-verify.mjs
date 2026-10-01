import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾';
const BAD = '艾薇儿';

console.log('══ 残留「艾薇儿」(排除引文/裁定注记) ══');
let n = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/^(tools|node_modules|dist|\.patch-history)$/.test(e.name)) walk(p); }
    else {
      for (const b of [BAD, '艾薇儿']) if (e.name.includes(b)) { console.log(`  文件名 ${path.relative(ROOT, p)}`); n++; }
      if (!/\.(ya?ml|md|ts|vue|json|txt)$/.test(e.name)) continue;
      fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        if (!l.includes(BAD)) return;
        const isQuote = /^\s*text:/.test(l);
        const isRuling = /术语纪律/.test(p);
        n++;
        console.log(`  ${isQuote ? '[引文·保留]' : isRuling ? '[裁定注记·保留]' : '[!! 需处理]'} ${path.relative(ROOT, p)}:${i + 1}  ${l.trim().slice(0, 120)}`);
      });
    }
  }
})(ROOT);
if (!n) console.log('  （无）');

console.log('\n══ MVU 键一致性：schema.ts 中的人名键 ══');
const sc = fs.readFileSync(`${ROOT}/schema.ts`, 'utf8');
for (const k of ['艾薇尔', '海伦.列娜', '凝玉']) {
  const m = sc.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => l.includes(k));
  console.log(`  ${k}: ${m.length} 处${m.length ? ' → L' + m.map(([i]) => i).join(', L') : ''}`);
}

console.log('\n══ entryManifest 中的角色条目 ══');
const st = JSON.parse(fs.readFileSync(`${ROOT}/tavern-cards-state.json`, 'utf8'));
for (const [k, v] of Object.entries(st.entryManifest['角色'] ?? {})) {
  if (k.includes('艾薇')) console.log(`  ${k}  → contents.file=${JSON.stringify(v.contents?.find?.(c => c.file)?.file)}  path=${v.path}`);
}
console.log('\n  initvar.yaml 中:');
fs.readFileSync(`${ROOT}/世界书/变量/initvar.yaml`, 'utf8').split('\n').forEach((l, i) => {
  if (l.includes('艾薇')) console.log(`    L${i + 1}: ${l}`);
});
