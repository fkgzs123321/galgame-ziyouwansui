import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const ROOT = 'src/兽血沸腾/世界书/角色';
const ROSTER = ['凝玉','艾薇尔','崔蓓茜','歌坦妮','若尔娜','黛丝','贞德','白素青','谭雅','阿仙奴','许德拉','歌莉妮','唐蓓尔金娜','梦露','嘉宝','艾莉婕'];

// 1. 抽取每个文件的一级键
function topKeys(file) {
  const raw = fs.readFileSync(file, 'utf8');
  // 剥掉 @@ 装饰器与 EJS 控制行，取纯 YAML 部分
  const body = raw
    .replace(/^@@[^\n]*\n/, '')
    .split('\n')
    .filter((l) => !/^\s*<%_?/.test(l))
    .join('\n');
  try {
    const d = YAML.parse(body);
    return d && typeof d === 'object' ? Object.keys(d) : [];
  } catch (e) { return ['<解析失败:' + e.message.slice(0, 30) + '>']; }
}

console.log('══ 一级键对照（取前 3 人抽样）══');
for (const n of ROSTER.slice(0, 3)) {
  const b = topKeys(path.join(ROOT, n, '基础信息.yaml'));
  const p = topKeys(path.join(ROOT, n, '私密.yaml'));
  const s = topKeys(path.join(ROOT, n, '性格调色盘.yaml'));
  const st = topKeys(path.join(ROOT, n, '私密阶段.yaml'));
  console.log(`\n【${n}】`);
  console.log('  基础信息  ' + b.join(' / '));
  console.log('  性格调色盘 ' + s.join(' / '));
  console.log('  私密     ' + p.join(' / '));
  console.log('  私密阶段   ' + st.join(' / '));
}

// 2. 全名单：基础信息 与 私密 的键重叠统计
console.log('\n══ 基础信息 ∩ 私密 键重叠 ══');
const allB = new Set(), allP = new Set();
let pairOverlap = [];
for (const n of ROSTER) {
  const b = topKeys(path.join(ROOT, n, '基础信息.yaml'));
  const p = topKeys(path.join(ROOT, n, '私密.yaml'));
  b.forEach((k) => allB.add(k));
  p.forEach((k) => allP.add(k));
  const inter = b.filter((k) => p.includes(k));
  pairOverlap.push({ n, b: b.length, p: p.length, inter });
}
console.log('基础信息 键并集 ' + allB.size + ' 个: ' + [...allB].join('、'));
console.log('\n私密 键并集 ' + allP.size + ' 个: ' + [...allP].join('、'));
console.log('\n两人之间实际重叠:');
for (const r of pairOverlap) console.log(`  ${r.n.padEnd(6)} 基础${String(r.b).padStart(2)} 私密${String(r.p).padStart(2)}  重叠[${r.inter.join('、') || '无'}]`);

// 3. 全名单并集层面重叠
const interAll = [...allB].filter((k) => allP.has(k));
console.log('\n并集层面重叠键 (' + interAll.length + '): ' + (interAll.join('、') || '无'));
const bOnly = [...allB].filter((k) => !allP.has(k));
const pOnly = [...allP].filter((k) => !allB.has(k));
console.log('仅基础信息有 (' + bOnly.length + '): ' + bOnly.join('、'));
console.log('仅私密有   (' + pOnly.length + '): ' + pOnly.join('、'));
