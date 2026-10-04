import fs from 'fs';
import path from 'path';

const root = 'src';

function leafOf(proj, type, name) {
  const st = JSON.parse(fs.readFileSync(path.join(root, proj, 'tavern-cards-state.json'), 'utf8'));
  return { leaf: st.entryManifest?.[type]?.[name], st };
}

function dump(proj, type, name) {
  const { leaf } = leafOf(proj, type, name);
  console.log(`\n════ ${proj} :: ${type} :: ${name} ════`);
  if (!leaf) { console.log('  (不存在)'); return; }
  console.log('  path:', leaf.path, '| part:', leaf.part, '| scope:', leaf.scope, '| rephrase:', leaf.rephrase);
  console.log('  contents:');
  (leaf.contents || []).forEach((f, i) => {
    if (f.content !== undefined) console.log(`    [${i}] content = ${JSON.stringify(f.content).slice(0, 400)}`);
    else console.log(`    [${i}] file    = ${f.file}`);
  });
  // 打印文件行
  let fp = leaf.path ? path.join(root, proj, leaf.path) : null;
  if (!fp && Array.isArray(leaf.contents)) {
    const f = leaf.contents.find(x => x.file);
    if (f) fp = path.join(root, proj, f.file);
  }
  if (fp && fs.existsSync(fp)) {
    const lines = fs.readFileSync(fp, 'utf8').split('\n');
    console.log(`  文件 ${fp} 共 ${lines.length} 行；前 4 行:`);
    lines.slice(0, 4).forEach((l, n) => console.log(`    ${n + 1}| ${l.slice(0, 160)}`));
  } else if (fp) console.log(`  文件不存在: ${fp}`);
}

// 1. 伏魔记 other 叶子的真实形状
const fumo = JSON.parse(fs.readFileSync(path.join(root, '旮旯给木-伏魔记', 'tavern-cards-state.json'), 'utf8'));
const fumoOther = Object.entries(fumo.entryManifest['角色'] || {}).filter(([, v]) => v.part === 'other');
console.log(`伏魔记 other 条目数: ${fumoOther.length}`);
fumoOther.slice(0, 3).forEach(([n]) => dump('旮旯给木-伏魔记', '角色', n));

// 2. 怨妇救赎 私密档案 vs 阶段行为
const yf = JSON.parse(fs.readFileSync(path.join(root, '怨妇救赎', 'tavern-cards-state.json'), 'utf8'));
const yfChar = Object.keys(yf.entryManifest['角色'] || {});
console.log('\n\n怨妇救赎 角色条目名:', yfChar.filter(n => /林曼云/.test(n)).join(' | '));
yfChar.filter(n => /林曼云/.test(n)).forEach(n => dump('怨妇救赎', '角色', n));

// 3. 不要玩弄我的鸡吧-forge
const bw = JSON.parse(fs.readFileSync(path.join(root, '不要玩弄我的鸡吧-forge', 'tavern-cards-state.json'), 'utf8'));
const bwChar = Object.keys(bw.entryManifest['角色'] || {});
console.log('\n\n不要玩弄我的鸡吧-forge 林婉清 条目:', bwChar.filter(n => /林婉清/.test(n)).join(' | '));
bwChar.filter(n => /林婉清/.test(n)).forEach(n => dump('不要玩弄我的鸡吧-forge', '角色', n));

// 4. 全库：有没有任何 contents 片段以 @@ 开头
console.log('\n\n════ 全库 contents 片段以 @@ 开头的统计 ════');
const projects = fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && fs.existsSync(path.join(root, d.name, 'tavern-cards-state.json')))
  .map(d => d.name);
const tally = {};
for (const p of projects) {
  const st = JSON.parse(fs.readFileSync(path.join(root, p, 'tavern-cards-state.json'), 'utf8'));
  for (const entries of Object.values(st.entryManifest || {})) {
    for (const [name, leaf] of Object.entries(entries || {})) {
      (leaf?.contents || []).forEach((f, i) => {
        const c = String(f.content || '');
        const m = c.match(/^(@@\w+)/);
        if (m) {
          const k = `${m[1]} @frag${i}`;
          tally[k] = tally[k] || [];
          if (tally[k].length < 3) tally[k].push(`${p}::${name}`);
        }
      });
    }
  }
}
Object.entries(tally).sort().forEach(([k, v]) => console.log(`  ${k.padEnd(22)} ${v.join(', ')}`));
