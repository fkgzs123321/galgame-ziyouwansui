// 只读探针：量化 基础信息 vs 私密 的字段重叠，以及 性格调色盘 vs 私密阶段 的轴/分支重叠。
import fs from 'fs';
import path from 'path';

const R = 'src/兽血沸腾/世界书/角色';
const ROSTER = [
  '凝玉','艾薇尔','崔蓓茜','歌坦妮','若尔娜','黛丝','贞德','白素青','谭雅',
  '阿仙奴','许德拉','歌莉妮','唐蓓尔金娜','梦露','嘉宝','艾莉婕',
];

// 取一个 yaml 里某个顶层键下的所有二级键
const sub = (text, top) => {
  const lines = text.split('\n');
  const i = lines.findIndex(l => new RegExp(`^${top}:\\s*$`).test(l));
  if (i < 0) return [];
  const out = [];
  for (let j = i + 1; j < lines.length; j++) {
    if (/^\S/.test(lines[j]) && lines[j].trim()) break;
    const m = lines[j].match(/^ {2}([^\s:#][^:]*):/);
    if (m) out.push(m[1].trim());
  }
  return out;
};
// 取全部二级键（跨所有顶层）
const allKeys = text => {
  const out = [];
  for (const l of text.split('\n')) {
    const m = l.match(/^ {2}([^\s:#][^:]*):/);
    if (m) out.push(m[1].trim());
  }
  return out;
};

console.log('══ 基础信息 vs 私密：二级键重叠 ══\n');
let totBasic = 0, totNsfw = 0, totOverlap = 0;
for (const n of ROSTER) {
  const b = fs.readFileSync(path.join(R, n, '基础信息.yaml'), 'utf8');
  const s = fs.readFileSync(path.join(R, n, '私密.yaml'), 'utf8');
  const bk = new Set([...allKeys(b)]);
  const sk = new Set([...sub(s, '外观'), ...sub(s, '气味'), ...sub(s, '分泌物'), ...sub(s, '敏感带')]);
  const ov = [...bk].filter(k => sk.has(k));
  // 近似：同名词根
  const fuzzy = [...bk].filter(k => [...sk].some(s2 => s2 !== k && (s2.includes(k) || k.includes(s2)) && k.length >= 1));
  totBasic += bk.size; totNsfw += sk.size; totOverlap += ov.length;
  console.log(
    `${n.padEnd(8)} 基础信息二级键=${String(bk.size).padStart(2)}  私密部位类键=${String(sk.size).padStart(2)}` +
      `  精确重叠=${ov.length ? ov.join('、') : '无'}` +
      (fuzzy.length ? `  近似=${[...new Set(fuzzy)].join('、')}` : ''),
  );
}
console.log(`\n合计：基础信息 ${totBasic} 键，私密 ${totNsfw} 键，精确重叠 ${totOverlap} 键`);

console.log('\n\n══ 性格调色盘 vs 私密阶段：轴线与分支重叠 ══\n');
const getAxis = t => {
  const m = t.match(/getvar\(\s*'([^']+)'/);
  return m ? m[1] : '(无)';
};
const getThresh = t => [...t.matchAll(/[<>]=?\s*(\d+)/g)].map(x => x[1]);
for (const n of ROSTER) {
  const p1 = path.join(R, n, '性格调色盘.yaml');
  const p2 = path.join(R, n, '私密阶段.yaml');
  if (!fs.existsSync(p1) || !fs.existsSync(p2)) { console.log(`${n.padEnd(8)} 缺文件`); continue; }
  const a = fs.readFileSync(p1, 'utf8'), b = fs.readFileSync(p2, 'utf8');
  const axA = getAxis(a), axB = getAxis(b);
  const tA = getThresh(a).join('/'), tB = getThresh(b).join('/');
  console.log(
    `${n.padEnd(8)} 调色盘轴=${axA.replace('stat_data.', '').padEnd(22)} 阈值=${tA.padEnd(12)}` +
      `${axA === axB && tA === tB ? '  ⚠ 轴+阈值完全相同' : axA === axB ? '  △ 同轴不同阈值' : '  ✓ 不同轴'}`,
  );
  console.log(`         私密阶段轴=${axB.replace('stat_data.', '').padEnd(22)} 阈值=${tB}`);
  // 正文词重叠率（粗）
  const w = s => new Set((s.match(/[\u4e00-\u9fa5]{3,}/g) || []));
  const wa = w(a), wb = w(b);
  const inter = [...wa].filter(x => wb.has(x));
  console.log(`         正文三元词组重叠: ${inter.length} 个（调色盘 ${wa.size} 词 / 私密阶段 ${wb.size} 词）`);
}
