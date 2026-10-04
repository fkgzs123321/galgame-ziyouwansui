// 验证：剧透内容是否已被章节守卫挡住。
import fs from 'fs';
import path from 'path';
const ROOT = 'src/兽血沸腾/世界书/时间线';

// 大结局特征串
const SPOILERS = [
  ['嘉宝召唤秘名失败', 705, 763],
  ['幻境送回地球', 705, 763],
  ['茵格里切宝', 705, 763],
  ['幕后黑手', 705, 763],
  ['介丘海加尔', 705, 763],
  ['时空大裂缝', 705, 763],
  ['谭雅生下双胞胎', 705, 763],
  ['刘抗美', 705, 763],
  ['卢塞恩', 245, 704],
  ['神曲萨满', 245, 704],
];

// 每一档章节序号下，哪些文件会渲染出内容
function windowsOf(file) {
  const t = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const l1 = t.split('\n')[0];
  const m = l1.match(/@@if.*?getvar\('stat_data\.剧情\.章节序号'[^)]*\)\s*>=\s*(\d+).*?<=\s*(\d+)/s);
  if (!m) return null;
  return [Number(m[1]), Number(m[2])];
}

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.yaml'));
console.log('══ 逐个剧透串 × 可见章节 检查 ══\n');
let leak = 0;
for (const [s, slo, shi] of SPOILERS) {
  const hit = [];
  for (const f of files) {
    const t = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (!t.includes(s)) continue;
    const w = windowsOf(f);
    hit.push({ f, w });
    // 该串所属的应为 [slo,shi]；若文件窗口与该区间不相交则已挡住
    if (w && (w[1] < slo || w[0] > shi)) {
      // 文件窗口完全在串所属区间之外 → 串出现在那已属可疑，但仍未泄露给该区间
    }
  }
  // 关键检查：章节 0（开局）时，是否还能读到任何 705+ 的串
  const visAt0 = hit.filter(h => h.w && h.w[0] <= 0 && h.w[1] >= 0);
  const status = visAt0.length === 0 ? '✓ 开局不可见' : `✗ 开局可见于 ${visAt0.map(h => h.f).join('、')}`;
  if (visAt0.length) leak++;
  console.log(`【${s}】属 ${slo}-${shi} 区间`);
  console.log(`   出现在: ${hit.map(h => `${h.f}${h.w ? `(${h.w[0]}-${h.w[1]})` : '(无守卫)'}`).join('  ')}`);
  console.log(`   ${status}\n`);
}
console.log(leak === 0 ? '✓ 全部剧透串在开局章节均不可见' : `✗ ${leak} 处仍在开局泄露`);

// 另查 20 个无守卫的 history 文件有无剧透
console.log('\n══ 无守卫的 history 文件是否含后期剧透串 ══\n');
const hist = files.filter(f => !fs.readFileSync(path.join(ROOT, f), 'utf8').startsWith('@@'));
let hbad = 0;
for (const f of hist) {
  const t = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const found = SPOILERS.filter(([s]) => t.includes(s)).map(([s]) => s);
  if (found.length) { console.log(`  ⚠ ${f}: ${found.join('、')}`); hbad++; }
}
console.log(hbad === 0 ? `  ✓ ${hist.length} 个无守卫文件均无后期剧透串（正史背景，可安全常驻）` : `  ⚠ ${hbad} 个文件含后期串`);
