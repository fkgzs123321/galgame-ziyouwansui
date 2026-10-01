import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾';
const BAD = ['艾薇儿', '那迦', '艾佛森', '福克森', '崔蓓西', '南十字森林', '若文诺克', '琴心战歌', '地底军工基地', '斯迈禁空之歌', '博克村', '晕眩之歌', '圣弗朗西斯科'];

console.log('══ 目录名 / 文件名中的异写 ══');
let n = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (/^(tools|node_modules|dist)$/.test(e.name)) continue;
      for (const b of BAD) if (e.name.includes(b)) { console.log(`  目录 ${path.relative(ROOT, p)}`); n++; }
      walk(p);
    } else {
      for (const b of BAD) if (e.name.includes(b)) { console.log(`  文件 ${path.relative(ROOT, p)}`); n++; }
    }
  }
})(ROOT);
if (!n) console.log('  （无）');

console.log('\n══ entryManifest 中的条目名含异写 ══');
const st = JSON.parse(fs.readFileSync(`${ROOT}/tavern-cards-state.json`, 'utf8'));
let m = 0;
(function walk(o, p) {
  if (!o || typeof o !== 'object') return;
  for (const [k, v] of Object.entries(o)) {
    for (const b of BAD) if (k.includes(b)) { console.log(`  ${p}/${k}`); m++; }
    if (v && typeof v === 'object') walk(v, `${p}/${k}`);
  }
})(st.entryManifest, 'entryManifest');
if (!m) console.log('  （无）');

console.log('\n══ 角色/艾薇儿 目录内容 ══');
for (const f of fs.readdirSync(`${ROOT}/世界书/角色/艾薇儿`)) {
  const c = fs.readFileSync(`${ROOT}/世界书/角色/艾薇儿/${f}`, 'utf8');
  console.log(`  ── ${f} (${c.length} B) ──`);
  c.split('\n').slice(0, 4).forEach(l => console.log(`     ${l}`));
}
