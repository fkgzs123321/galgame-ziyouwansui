import fs from 'fs';
import path from 'path';

// 全库扫描：找 part=other 里「文件行1 是 @@private（非 @@if）」的条目
const root = 'src';
const projects = fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && fs.existsSync(path.join(root, d.name, 'tavern-cards-state.json')))
  .map(d => d.name);

console.log('项目:', projects.join(', '), '\n');

const stats = { privateXml: [], privateNoXml: [], ifXml: [] };

for (const p of projects) {
  const st = JSON.parse(fs.readFileSync(path.join(root, p, 'tavern-cards-state.json'), 'utf8'));
  const man = st.entryManifest || {};
  for (const [type, entries] of Object.entries(man)) {
    for (const [name, leaf] of Object.entries(entries || {})) {
      if (leaf?.part !== 'other') continue;
      const hasXml = Array.isArray(leaf.contents) && leaf.contents.some(f => /^<[A-Za-z_]/.test(String(f.content || '').replace(/^---\n/, '')));
      const regEjs = Array.isArray(leaf.contents) && String(leaf.contents[0]?.content || '').startsWith('@@');
      const regIf = Array.isArray(leaf.contents) && String(leaf.contents[0]?.content || '').startsWith('@@if ');
      let fileL1 = null, filePath = null;
      if (leaf.path) filePath = path.join(root, p, leaf.path);
      else if (Array.isArray(leaf.contents)) {
        const f = leaf.contents.find(x => x.file);
        if (f) filePath = path.join(root, p, f.file);
      }
      if (filePath && fs.existsSync(filePath)) {
        fileL1 = fs.readFileSync(filePath, 'utf8').split('\n')[0].trim();
      }
      const rec = { p, name, regEjs, regIf, hasXml, fileL1, mode: leaf.path ? 'path' : 'contents' };
      if (fileL1 && /^@@(?!if )/.test(fileL1) && hasXml) stats.privateXml.push(rec);
      else if (fileL1 && /^@@(?!if )/.test(fileL1) && !hasXml) stats.privateNoXml.push(rec);
      else if (regIf && hasXml) stats.ifXml.push(rec);
    }
  }
}

console.log(`【A】文件行1=@@private 且 有XML  → ${stats.privateXml.length} 条`);
stats.privateXml.slice(0, 10).forEach(r => console.log(`   ${r.p} :: ${r.name} | mode=${r.mode} | L1=${r.fileL1}`));
console.log(`\n【B】文件行1=@@private 且 无XML  → ${stats.privateNoXml.length} 条  ← 本项目应采用`);
stats.privateNoXml.slice(0, 12).forEach(r => console.log(`   ${r.p} :: ${r.name} | mode=${r.mode} | L1=${r.fileL1}`));
console.log(`\n【C】注册层 @@if + XML（伏魔记式）→ ${stats.ifXml.length} 条`);
stats.ifXml.slice(0, 6).forEach(r => console.log(`   ${r.p} :: ${r.name} | L1=${r.fileL1}`));
