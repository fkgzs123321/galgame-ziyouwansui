// 审计：把 54 个角色条目的性别、part 分布、是否进入私密名册三件事对齐，
// 确认「成年女性都覆盖到了」这个前提没有漏人。
import fs from 'fs';
import path from 'path';

const PROJ = 'src/兽血沸腾';
const state = JSON.parse(fs.readFileSync(path.join(PROJ, 'tavern-cards-state.json'), 'utf8'));

const ROSTER = [
  ...fs
    .readFileSync(path.join(PROJ, 'tools/reg-nsfw.mjs'), 'utf8')
    .match(/const ROSTER = \[([\s\S]*?)\n\];/)[1]
    .matchAll(/\['([^']+)'/g),
].map(m => m[1]);

// 性别从 创作规划.yaml 的 characters 段取；取不到就标 ?
const plan = fs.readFileSync(path.join(PROJ, '创作规划.yaml'), 'utf8');
const femaleByName = new Map();
{
  const re = /-\s*name:\s*([^\n]+)\n([\s\S]*?)(?=\n\s*-\s*name:|\n[a-z_]+:\s*$|$)/g;
  let m;
  while ((m = re.exec(plan))) {
    const name = m[1].trim().replace(/^['"]|['"]$/g, '');
    const gender = (m[2].match(/^\s*gender:\s*([^\n]+)/m) || [])[1];
    if (gender) femaleByName.set(name, gender.trim().replace(/^['"]|['"]$/g, ''));
  }
}

const entries = state.entryManifest['角色'];
const byChar = new Map();
for (const [n, v] of Object.entries(entries)) {
  const base = n.split('_')[0];
  if (base === '角色速览') continue;
  if (!byChar.has(base)) byChar.set(base, []);
  byChar.get(base).push(v.part || 'none');
}

console.log('角色'.padEnd(14) + '性别'.padEnd(8) + '条目'.padEnd(34) + '名册');
console.log('─'.repeat(74));
const missFemale = [];
for (const [name, parts] of [...byChar.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh'))) {
  const g = femaleByName.get(name) || '?';
  const inRoster = ROSTER.includes(name);
  const hasNSFW = parts.includes('other');
  const mark = inRoster ? (hasNSFW ? '✓' : '…待写') : '';
  // 女性但不在名册、且没有 other —— 候选漏人
  if (!inRoster && !hasNSFW && /女|雌|母/.test(g)) missFemale.push(name);
  console.log(
    name.padEnd(14) + g.padEnd(8) + (parts.join(',') || '-').padEnd(34) + mark,
  );
}

console.log('\n名册人数:', ROSTER.length);
console.log('已注册 other:', [...byChar.values()].filter(p => p.includes('other')).length);
console.log('名册中尚未注册:', ROSTER.filter(n => !(byChar.get(n) || []).includes('other')).join('、') || '无');
console.log('女性但既不在名册也无 other（需人工判定）:', missFemale.length ? missFemale.join('、') : '无');
