import fs from 'fs';
const S = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const init = fs.readFileSync('src/兽血沸腾/世界书/变量/initvar.yaml', 'utf8');

// 1) 关系 段里都有谁
const m = init.match(/^关系:[\s\S]*?(?=^\S)/m);
const rel = m ? [...m[0].matchAll(/^  ([^\s:][^:]*):/gm)].map(x => x[1]) : [];
console.log(`══ initvar 关系 段 ${rel.length} 人 ══`);
console.log(rel.join('、'));

// 2) 目标 4 人是否在内
const TARGET = ['喀秋莎', '茜茜', '姬丝凯碧', '安瑞达', '海伦.列娜', '茉儿'];
console.log('\n══ 目标人物在 关系 段？ ══');
for (const t of TARGET) console.log(`  ${t.padEnd(10)} ${rel.includes(t) ? '✓ 在' : '✗ 不在'}`);

// 3) 已有调色盘用的分档轴
console.log('\n══ 现有 性格调色盘 的分档轴 ══');
const dir = 'src/兽血沸腾/世界书/角色';
for (const n of fs.readdirSync(dir)) {
  const p = `${dir}/${n}/性格调色盘.yaml`;
  if (!fs.existsSync(p)) continue;
  const t = fs.readFileSync(p, 'utf8');
  const g = t.match(/getvar\('([^']+)'/);
  const nums = [...t.matchAll(/(?:aff|chap|章节序号)[^\n]*?([<>]=?\s*\d+)/g)].map(x => x[1]);
  const conds = [...t.matchAll(/if\s*\(\s*(.{0,60}?)\s*\)\s*\{/g)].map(x => x[1].trim());
  console.log(`  ${n.padEnd(10)} 轴=${(g ? g[1] : '—').padEnd(28)} 分支=${conds.length}`);
  if (['谭雅', '贞德', '凝玉'].includes(n)) conds.forEach(c => console.log(`        ${c}`));
}

// 4) 角色 类型下 4 人的注册情况
console.log('\n══ 角色 注册（目标 4 人）══');
for (const t of ['喀秋莎', '茜茜', '姬丝凯碧', '安瑞达']) {
  const keys = Object.keys(S.entryManifest['角色']).filter(k => k.startsWith(t));
  console.log(`  ${t.padEnd(10)} ${keys.join(' · ') || '（无）'}`);
}
