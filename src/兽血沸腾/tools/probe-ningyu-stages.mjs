import fs from 'fs';
import YAML from 'yaml';

const src = fs.readFileSync('src/兽血沸腾/世界书/角色/凝玉/私密.yaml', 'utf8');
const lines = src.split('\n');
const body = lines.slice(2).join('\n'); // 去 @@private 与 const 行

const render = aff => {
  const t = body
    .replace(/<%_\s*if \(aff < 20\) \{ _%>/, aff < 20 ? '\u0001' : '\u0002')
    .replace(/<%_\s*\} else if \(aff < 50\) \{ _%>/, aff < 50 ? '\u0001' : '\u0002')
    .replace(/<%_\s*\} else if \(aff < 80\) \{ _%>/, aff < 80 ? '\u0001' : '\u0002')
    .replace(/<%_\s*\} else \{ _%>/, '\u0001')
    .replace(/<%_\s*\} _%>/g, '\u0003');
  // 简化：直接按 aff 手工挑分支
  const segs = body.split(/(?=<%_)/);
  let out = '', depth = 0;
  const keep = [];
  if (aff < 20) keep.push(0); else if (aff < 50) keep.push(1); else if (aff < 80) keep.push(2); else keep.push(3);
  let idx = -1, active = false;
  for (const s of segs) {
    if (s.startsWith('<%_')) {
      if (/if \(aff < 20\)/.test(s)) { idx++; active = (idx === keep[0]); continue; }
      if (/else if \(aff < 50\)/.test(s)) { idx++; active = (idx === keep[0]); continue; }
      if (/else if \(aff < 80\)/.test(s)) { idx++; active = (idx === keep[0]); continue; }
      if (/else \{/.test(s)) { idx++; active = (idx === keep[0]); continue; }
      if (/\} _%>/.test(s)) { active = false; continue; }
      continue;
    }
    if (active) out += s;
  }
  return YAML.parse(out);
};

for (const aff of [0, 30, 60, 95]) {
  const o = render(aff);
  console.log(`\n═══ 好感度 ${aff} → 阶段「${o['阶段']}」═══`);
  console.log('  边界:', o['边界']);
  console.log('  身体状态:', o['身体状态']);
  console.log('  keys:', Object.keys(o).length, '| 外观项:', Object.keys(o['外观'] || {}).length);
}
