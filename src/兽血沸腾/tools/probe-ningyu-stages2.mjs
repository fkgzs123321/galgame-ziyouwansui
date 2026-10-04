import fs from 'fs';
import YAML from 'yaml';

const src = fs.readFileSync('src/兽血沸腾/世界书/角色/凝玉/私密.yaml', 'utf8');
const lines = src.split('\n');

// 去掉 @@private 与 const 行，把 if/else 转成标记，按段切
const body = lines.slice(2).join('\n');
const segs = body.split(/^(<%_.*?%>)$/m);

const render = aff => {
  const pick = aff < 20 ? 0 : aff < 50 ? 1 : aff < 80 ? 2 : 3;
  let branch = -1, active = true, out = '';
  for (const s of segs) {
    const m = s.match(/^<%_\s*(.*?)\s*_%>$/s);
    if (m) {
      const c = m[1].replace(/^\}\s*/, '');
      if (/^if \(aff < 20\)/.test(c)) { branch = 0; active = branch === pick; }
      else if (/^else if \(aff < 50\)/.test(c)) { branch = 1; active = branch === pick; }
      else if (/^else if \(aff < 80\)/.test(c)) { branch = 2; active = branch === pick; }
      else if (/^else/.test(c)) { branch = 3; active = branch === pick; }
      else if (/^\}/.test(c) || c === '}') { active = false; }
      continue;
    }
    if (active) out += s;
  }
  return out;
};

for (const aff of [0, 30, 60, 95]) {
  const txt = render(aff);
  const o = YAML.parse(txt);
  console.log(`\n═══ 好感度 ${aff} → 阶段「${o?.['阶段']}」═══`);
  console.log('  边界:', o?.['边界']);
  console.log('  身体状态:', o?.['身体状态']);
  console.log('  落点:', o?.['落点']);
  console.log('  顶层键:', Object.keys(o || {}).length, '| 外观项:', Object.keys(o?.['外观'] || {}).length);
  if (!o) console.log('  !! YAML 解析失败，前 200 字:\n', txt.slice(0, 200));
}
