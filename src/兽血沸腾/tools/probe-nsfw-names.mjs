// 只读：私密条目的真实命名 + check-structure 的约束 + 是否存在「叠装饰器」先例。
import fs from 'fs';
import path from 'path';

const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));

console.log('══ 所有 角色 条目名（含 私密 的）══');
const M = st.entryManifest.角色;
Object.keys(M).filter(k => /私密|NSFW|色|性/.test(k)).forEach(k => {
  const v = M[k];
  console.log(`   ${k.padEnd(24)} 注册=${v.contents ? 'contents' : 'path'}  part=${v.part}  file=${v.path || (v.contents || []).find(c => c.file)?.file}`);
});

console.log('\n══ 条目名后缀分布（角色）══');
const 后缀 = {};
for (const k of Object.keys(M)) {
  const s = k.includes('_') ? k.slice(k.lastIndexOf('_')) : '（无后缀）';
  后缀[s] = (后缀[s] || 0) + 1;
}
Object.entries(后缀).sort((a, b) => b[1] - a[1]).forEach(([s, n]) => console.log(`   ${s.padEnd(14)} ${n}`));

console.log('\n══ 磁盘上 私密.yaml 文件，及其是否被注册 ══');
const DIR = `${PROJ}/世界书/角色`;
const 注册文件 = new Set();
for (const v of Object.values(M)) {
  if (v.path) 注册文件.add(v.path);
  for (const c of v.contents || []) if (c.file) 注册文件.add(c.file);
}
let 未注册 = [], 已注册 = 0;
for (const d of fs.readdirSync(DIR, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  for (const f of fs.readdirSync(path.join(DIR, d.name))) {
    const rel = `世界书/角色/${d.name}/${f}`;
    if (/私密/.test(f)) { if (注册文件.has(rel)) 已注册++; else 未注册.push(rel); }
  }
}
console.log(`   私密相关文件：已注册 ${已注册}，未注册 ${未注册.length}`);
未注册.forEach(x => console.log(`      ⚠ ${x}`));

console.log('\n══ 全仓「连续两行 @@」先例 ══');
const 扫 = (dir, depth = 0) => {
  if (depth > 4) return;
  let es; try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of es) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) 扫(p, depth + 1);
    else if (/\.(yaml|yml|txt|md)$/.test(e.name)) {
      let t; try { t = fs.readFileSync(p, 'utf8'); } catch { continue; }
      const L = t.split('\n');
      for (let i = 0; i + 1 < L.length; i++) {
        if (L[i].startsWith('@@') && L[i + 1].startsWith('@@')) { console.log(`   ${p}:${i + 1}  「${L[i]}」 + 「${L[i + 1]}」`); break; }
      }
    }
  }
};
扫('.');

console.log('\n══ check-structure.mjs 是否约束 角色/NPC 的 XML 包装 ══');
const cs = fs.readFileSync(`${PROJ}/tools/check-structure.mjs`, 'utf8');
const 相关 = cs.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /角色|NPC|character_|contents|part/.test(l));
相关.slice(0, 40).forEach(([n, l]) => console.log(`   ${String(n).padStart(3)} ${l}`));
