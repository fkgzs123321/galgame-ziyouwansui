import fs from 'fs';
import path from 'path';

const SRC = 'src';
const projects = fs.readdirSync(SRC, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);

const rows = [];
for (const p of projects) {
  const sf = path.join(SRC, p, 'tavern-cards-state.json');
  if (!fs.existsSync(sf)) continue;
  let st;
  try { st = JSON.parse(fs.readFileSync(sf, 'utf8')); } catch { continue; }
  const EM = st.entryManifest || {};
  for (const [type, entries] of Object.entries(EM)) {
    if (!entries || typeof entries !== 'object') continue;
    for (const [name, leaf] of Object.entries(entries)) {
      if (leaf?.part !== 'other') continue;
      const c0 = leaf.contents?.[0]?.content ?? '';
      const f = leaf.contents?.find?.(x => x.file)?.file ?? leaf.path ?? '';
      let firstLine = '';
      if (f) { try { firstLine = fs.readFileSync(path.join(SRC, p, f), 'utf8').split('\n')[0]; } catch {} }
      const hasEjsReg = typeof c0 === 'string' && c0.startsWith('@@');
      const hasEjsFile = firstLine.startsWith('@@');
      const hasXml = (leaf.contents || []).some(x => typeof x.content === 'string' && x.content.includes('<character'));
      rows.push({ p, name, reg: leaf.path ? 'path' : 'contents', hasEjsReg, hasEjsFile, hasXml, firstLine: firstLine.slice(0, 46) });
    }
  }
}

console.log(`══ 全部项目 part=other 条目：${rows.length} 条 ══\n`);
const combo = {};
for (const r of rows) {
  const k = `${r.reg}|regEJS=${r.hasEjsReg}|fileEJS=${r.hasEjsFile}|XML=${r.hasXml}`;
  combo[k] = (combo[k] || 0) + 1;
}
console.log('注册方式组合统计:');
for (const [k, v] of Object.entries(combo).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(56)} ${v}`);

console.log('\n══ 带 EJS 的 other 条目明细（若存在）══');
const ejsOnes = rows.filter(r => r.hasEjsReg || r.hasEjsFile);
if (!ejsOnes.length) console.log('  （无）');
for (const r of ejsOnes.slice(0, 20)) console.log(`  [${r.p}] ${r.name}  ${r.reg} regEJS=${r.hasEjsReg} fileEJS=${r.hasEjsFile} XML=${r.hasXml}\n      ${JSON.stringify(r.firstLine)}`);

console.log('\n══ 每项目 other 计数 ══');
const byP = {};
for (const r of rows) byP[r.p] = (byP[r.p] || 0) + 1;
for (const [k, v] of Object.entries(byP).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(34)} ${v}`);

console.log('\n══ 兽血沸腾 角色 other 阈值与 partOrder ══');
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
console.log('strategyThresholds.角色 =', JSON.stringify(st.strategyThresholds?.['角色']));
console.log('partOrder.角色 =', JSON.stringify(st.partOrder?.['角色']));
console.log('typeLists.after_char =', JSON.stringify(st.typeLists?.after_char));

console.log('\n══ 一个 other 条目的完整 leaf（欲望都市）══');
const yw = JSON.parse(fs.readFileSync('src/欲望都市/tavern-cards-state.json', 'utf8'));
for (const [n, l] of Object.entries(yw.entryManifest['角色'] || {})) {
  if (l.part === 'other') { console.log(JSON.stringify({ [n]: l }, null, 2)); break; }
}
