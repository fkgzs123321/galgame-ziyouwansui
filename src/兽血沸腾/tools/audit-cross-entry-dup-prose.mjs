// 探针：把「跨条目重复」拆成「参考语料内的重复」与「正文里的重复」。
//
// audit-cross-entry-dup.mjs 的归一化没有剔除 `参考语料:` 块，而那一块是逐字原文引用，
// 两个条目引用同一句原文是**合规的**（check-banned.mjs 的 inRefBlock() 也是这么豁免的），
// 不该算重复。这里把两者分开，只报正文里的重复。
import fs from 'fs';
import path from 'path';

const R = 'src/兽血沸腾/世界书/角色';
const MIN = Number(process.env.MIN || 20);
const ROSTER = [
  '凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝', '贞德', '白素青', '谭雅',
  '阿仙奴', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕',
  '幽月儿', '加茜娅', '伦娜', '费雯丽', '朝河兰', '珍妮佛', '波姬小丝', '赫莲娜',
  '安瑞达',
];
const FILES = ['基础信息', '性格调色盘', '私密', '私密阶段'];

// 剥离 参考语料/他人语料 子树：这些是逐字原文，重复引用不算缺陷。
// 判据：出现 `参考语料:` 或 `他人语料:` 后，后续缩进更深的行都算语料，直到遇到同级或更浅的键。
function 剥语料(t) {
  const out = [];
  let 语料缩进 = -1;
  for (const l of t.split('\n')) {
    const m = l.match(/^(\s*)(参考语料|他人语料)\s*:/);
    if (m) { 语料缩进 = m[1].length; out.push(''); continue; }
    if (语料缩进 >= 0) {
      const ind = l.match(/^(\s*)/)[1].length;
      if (l.trim() === '') { out.push(''); continue; }
      if (ind > 语料缩进) continue;      // 仍属语料块
      语料缩进 = -1;                      // 语料块结束
    }
    out.push(l);
  }
  return out.join('\n');
}

const 归一 = t => {
  const body = 剥语料(t)
    .split('\n')
    .filter(l => !/^\s*@@/.test(l) && !/<%/.test(l) && !/^\s*#/.test(l))
    .map(l => l.replace(/^\s*[^\s:]+:\s*/, ''))
    .join('\n');
  return body.replace(/[，、；：。！？""''「」（）《》…—\s\-·|>]/g, '');
};

const 归一全 = t => t
  .split('\n')
  .filter(l => !/^\s*@@/.test(l) && !/<%/.test(l) && !/^\s*#/.test(l))
  .map(l => l.replace(/^\s*[^\s:]+:\s*/, ''))
  .join('\n')
  .replace(/[，、；：。！？""''「」（）《》…—\s\-·|>]/g, '');

function 公共串(a, b) {
  const hits = new Set();
  for (let i = 0; i + MIN <= a.length; i++) {
    const 窗 = a.slice(i, i + MIN);
    let from = 0;
    for (;;) {
      const at = b.indexOf(窗, from);
      if (at < 0) break;
      let L = 0;
      while (i - L - 1 >= 0 && at - L - 1 >= 0 && a[i - L - 1] === b[at - L - 1]) L++;
      let Rt = MIN;
      while (i + Rt < a.length && at + Rt < b.length && a[i + Rt] === b[at + Rt]) Rt++;
      hits.add(a.slice(i - L, i + Rt));
      from = at + 1;
    }
  }
  const arr = [...hits].sort((x, y) => y.length - x.length);
  const out = [];
  for (const s of arr) if (!out.some(o => o.includes(s))) out.push(s);
  return out;
}

let 正文总 = 0, 语料总 = 0;
const 明细 = [];
for (const n of ROSTER) {
  const 正 = {}, 全 = {};
  for (const f of FILES) {
    const p = path.join(R, n, f + '.yaml');
    if (!fs.existsSync(p)) { 正[f] = null; 全[f] = null; continue; }
    const t = fs.readFileSync(p, 'utf8');
    正[f] = 归一(t); 全[f] = 归一全(t);
  }
  for (let i = 0; i < FILES.length; i++) {
    for (let j = i + 1; j < FILES.length; j++) {
      const a = 正[FILES[i]], b = 正[FILES[j]];
      const A = 全[FILES[i]], B = 全[FILES[j]];
      if (!A || !B) continue;
      const 全串 = 公共串(A, B);
      const 正串 = a && b ? 公共串(a, b) : [];
      正文总 += 正串.length;
      语料总 += 全串.length - 正串.length;
      for (const s of 正串) 明细.push({ 角色: n, 对: `${FILES[i]}×${FILES[j]}`, 串: s });
    }
  }
}

console.log(`══ 正文重复 ${正文总} 处 / 语料重复 ${语料总} 处（>=${MIN} 字）══`);
if (明细.length) {
  const byRole = {};
  for (const d of 明细) byRole[d.角色] = (byRole[d.角色] || 0) + 1;
  console.log('\n按角色（正文）：');
  Object.entries(byRole).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`   ${k.padEnd(12)} ${v}`));
  console.log('\n明细（正文）：');
  for (const d of 明细.sort((x, y) => x.角色.localeCompare(y.角色, 'zh'))) {
    console.log(`  【${d.角色}】${d.对.padEnd(20)} ${String(d.串.length).padStart(3)}字  ${d.串.slice(0, 60)}`);
  }
}
