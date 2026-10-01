// 给「按卷编写」的时间线条目加 @@if 章节守卫。
// 这些条目原本是 constant 全量常驻，等于开局就把后面各卷乃至大结局喂给 AI。
// 守卫写法与已正确的 48 篇事件条目完全一致。
import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书/时间线';
const DRY = process.argv.includes('--dry');

// [条目名, 起, 止]
const PLAN = [
  // 9 篇进度
  ['荒岛篇进度', 0, 8],
  ['胸罩岛篇进度', 9, 20],
  ['海上篇进度', 21, 30],
  ['多瑙大荒原篇进度', 31, 42],
  ['博格村与领地初建进度', 43, 58],
  ['翡冷翠领主期进度', 59, 72],
  ['纵横篇·成长期进度', 73, 244],
  ['纵横篇·扩张期进度', 245, 704],
  ['纵横篇·终盘进度', 705, 763],
  // 7 篇编年
  ['荒岛篇编年', 0, 8],
  ['胸罩岛篇编年', 9, 20],
  ['海上篇编年', 21, 30],
  ['多瑙大荒原篇编年', 31, 42],
  ['博格村与领地初建编年', 43, 58],
  ['翡冷翠领主期编年', 59, 72],
  ['纵横篇编年', 73, 763],
];

const guard = (lo, hi) =>
  `@@if getvar('stat_data.剧情.章节序号', { defaults: 0 }) >= ${lo} && ` +
  `getvar('stat_data.剧情.章节序号', { defaults: 0 }) <= ${hi}`;

console.log(`模式: ${DRY ? '预览（不写入）' : '写入'}\n`);
console.log('条目'.padEnd(24) + '区间'.padEnd(12) + '改前'.padEnd(10) + '改后');
console.log('─'.repeat(72));

let changed = 0, skipped = 0;
const segs = [];

for (const [name, lo, hi] of PLAN) {
  const p = path.join(ROOT, `${name}.yaml`);
  if (!fs.existsSync(p)) { console.log(`✗ 缺失 ${name}`); skipped++; continue; }
  const raw = fs.readFileSync(p, 'utf8');
  const before = raw.length;
  if (raw.startsWith('@@')) {
    const l1 = raw.split('\n')[0].slice(0, 40);
    console.log(`${name.padEnd(24)}${`${lo}-${hi}`.padEnd(14)}已有 @@ 跳过  (${l1})`);
    skipped++;
    continue;
  }
  if (raw.startsWith('\ufeff')) { console.log(`✗ ${name} 带 BOM`); skipped++; continue; }
  const out = `${guard(lo, hi)}\n${raw}`;
  if (!DRY) fs.writeFileSync(p, out, 'utf8');
  const after = out.length;
  console.log(`${name.padEnd(24)}${`${lo}-${hi}`.padEnd(14)}${String(before).padEnd(10)}${after}  (+${after - before})`);
  segs.push([lo, hi, name]);
  changed++;
}

console.log(`\n处理 ${changed} 个，跳过 ${skipped} 个`);

// 覆盖自检
segs.sort((a, b) => a[0] - b[0]);
const prog = segs.filter(s => s[2].endsWith('进度'));
console.log(`\n── 9 篇进度的窗口覆盖 ──`);
let prev = -1; let bad = 0;
for (const [lo, hi, n] of prog) {
  if (lo > prev + 1) { console.log(`  ✗ 缺口 ${prev + 1}~${lo - 1}（${n} 之前）`); bad++; }
  if (lo <= prev) { console.log(`  ✗ 重叠 ${n} 的 ${lo} 落在前一窗口内`); bad++; }
  prev = Math.max(prev, hi);
}
console.log(`  覆盖 0~${prev}；${bad === 0 ? 'OK 无缝无重叠' : `✗ ${bad} 处异常`}；终点应为 763 → ${prev === 763 ? 'OK' : '✗ ' + prev}`);
if (!DRY) console.log(`\n已写入 ${changed} 个文件（UTF-8 无 BOM，LF）`);
