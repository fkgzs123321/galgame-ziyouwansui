// 把原文行号换算成去重章节序号（正文内 idx 0~763），
// 为 12 位女性角色定「性格调色盘 / 私密阶段」的章节阈值。
import fs from 'fs';

const SRC = 'src/兽血沸腾/兽血沸腾.txt';
const lines = fs.readFileSync(SRC, 'utf8').split('\n');

// 1) 收集所有章节标题行（原始 784 条）
const HEAD = /^\s*第[一二三四五六七八九十百零〇]+章/;
const heads = [];
lines.forEach((l, i) => { if (HEAD.test(l)) heads.push({ line: i + 1, text: l.trim().slice(0, 40) }); });
console.log(`原文标题 ${heads.length} 条`);

// 2) 去重：同名标题只保留首个（与故事大纲 764 的算法一致）
const seen = new Set();
const dedup = [];
for (const h of heads) {
  const key = h.text.replace(/\s+/g, '');
  if (seen.has(key)) continue;
  seen.add(key); dedup.push(h);
}
console.log(`去重后 ${dedup.length} 章（期望 764）`);

// 3) 行号 → idx
function lineToIdx(line) {
  let lo = 0, hi = dedup.length - 1, ans = 0;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (dedup[m].line <= line) { ans = m; lo = m + 1; } else hi = m - 1; }
  return ans;
}

// 4) 目标人物：从 fem-material 的命中行里取行号，算首现/末现 idx
const T = ['幽月儿', '加茜娅', '伦娜', '费雯丽', '朝河兰', '珍妮佛', '波姬小丝', '赫莲娜', '安瑞达', '喀秋莎', '茜茜', '姬丝凯碧'];
const out = {};
for (const n of T) {
  const p = `src/兽血沸腾/tools/fem-material/${n}.txt`;
  if (!fs.existsSync(p)) { console.log(`✗ 缺 ${p}`); continue; }
  const nums = [...fs.readFileSync(p, 'utf8').matchAll(/^L(\d+):/gm)].map(m => +m[1]).sort((a, b) => a - b);
  if (!nums.length) { console.log(`! ${n} 无命中行`); continue; }
  const idxs = nums.map(lineToIdx);
  // 分段：找出命中行的 idx 分布（按四分位给候选阈值）
  const q = f => idxs[Math.min(idxs.length - 1, Math.floor(idxs.length * f))];
  out[n] = { 行数: nums.length, 首现idx: idxs[0], 末现idx: idxs[idxs.length - 1], 四分位: [q(0.25), q(0.5), q(0.75)] };
}

console.log('\n══ 首现 / 末现 / 四分位（去重 idx）══');
for (const n of T) if (out[n]) {
  const o = out[n];
  console.log(`  ${n.padEnd(8)} 行=${String(o.行数).padStart(3)}  首现=${String(o.首现idx).padStart(3)}  末现=${String(o.末现idx).padStart(3)}  四分位=${o.四分位.join('/')}`);
}

// 5) 逐行打印每人前 3 条命中的 (idx, 行号, 摘要)，供人工定阈值
console.log('\n══ 关键节点（每人前 3 + 后 3 条）══');
for (const n of T) {
  const p = `src/兽血沸腾/tools/fem-material/${n}.txt`;
  if (!fs.existsSync(p)) continue;
  const rows = [...fs.readFileSync(p, 'utf8').matchAll(/^L(\d+): (.*)$/gm)].map(m => ({ line: +m[1], t: m[2] }));
  if (!rows.length) continue;
  console.log(`\n── ${n} ──`);
  const pick = [...rows.slice(0, 3), ...rows.slice(-3)];
  for (const r of pick) console.log(`  idx${String(lineToIdx(r.line)).padStart(3)} L${r.line}: ${r.t.slice(0, 90)}`);
}
