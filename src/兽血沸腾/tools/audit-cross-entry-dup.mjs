// 探针 v3：跨条目整句重复检查（滑动窗口版）。
//
// v2 的缺陷（已证伪为假阴性）：它先按 [。！？\n] 切句、再整句比对，
// 于是「同一句话在两个条目里前后缀不同」就完全查不出来。
// 实测 v2 报 0 处，而同一批文件里真实存在数十处 12 字以上的共同子串。
//
// v3 改为：把正文归一化成一条无标点长串，用滑动窗口找出两两文件之间
// 长度 >= MIN 的公共子串，并合并成互不包含的最大串。
import fs from 'fs';
import path from 'path';

const R = 'src/兽血沸腾/世界书/角色';
const MIN = Number(process.env.MIN || 12);

// 名册：16 原 + 8 升格 + 安瑞达。缺文件的自动跳过，便于在补写过程中反复跑。
const ROSTER = [
  '凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝', '贞德', '白素青', '谭雅',
  '阿仙奴', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕',
  '幽月儿', '加茜娅', '伦娜', '费雯丽', '朝河兰', '珍妮佛', '波姬小丝', '赫莲娜',
  '安瑞达',
];
const FILES = ['基础信息', '性格调色盘', '私密', '私密阶段'];

// 归一化：去装饰器/控制行/注释行，去 YAML 键名前缀，去全部标点与空白。
const 归一 = t => {
  const body = t
    .split('\n')
    .filter(l => !/^\s*@@/.test(l) && !/<%/.test(l) && !/^\s*#/.test(l))
    .map(l => l.replace(/^\s*[^\s:]+:\s*/, ''))
    .join('\n');
  return body.replace(/[，、；：。！？""''「」（）《》…—\s\-·|>]/g, '');
};

// 取 a、b 的所有 >=MIN 公共子串，合并成互不包含的最大串。
function 公共串(a, b) {
  const hits = new Set();
  for (let i = 0; i + MIN <= a.length; i++) {
    const 窗 = a.slice(i, i + MIN);
    let from = 0;
    for (;;) {
      const at = b.indexOf(窗, from);
      if (at < 0) break;
      // 向左向右尽量扩
      let L = 0;
      while (i - L - 1 >= 0 && at - L - 1 >= 0 && a[i - L - 1] === b[at - L - 1]) L++;
      let Rt = MIN;
      while (i + Rt < a.length && at + Rt < b.length && a[i + Rt] === b[at + Rt]) Rt++;
      hits.add(a.slice(i - L, i + Rt));
      from = at + 1;
    }
  }
  // 去掉被别的命中完整包含的短串
  const arr = [...hits].sort((x, y) => y.length - x.length);
  const out = [];
  for (const s of arr) if (!out.some(o => o.includes(s))) out.push(s);
  return out;
}

let 总 = 0;
const 汇总 = {};
const 明细 = [];

for (const n of ROSTER) {
  const S = {};
  for (const f of FILES) {
    const p = path.join(R, n, f + '.yaml');
    S[f] = fs.existsSync(p) ? 归一(fs.readFileSync(p, 'utf8')) : null;
  }
  const 命中 = [];
  for (let i = 0; i < FILES.length; i++) {
    for (let j = i + 1; j < FILES.length; j++) {
      const a = S[FILES[i]], b = S[FILES[j]];
      if (!a || !b) continue;
      for (const s of 公共串(a, b)) {
        命中.push({ 对: `${FILES[i]}×${FILES[j]}`, 串: s });
      }
    }
  }
  if (命中.length) {
    总 += 命中.length;
    console.log(`\n【${n}】${命中.length} 处`);
    for (const h of 命中.sort((x, y) => y.串.length - x.串.length)) {
      console.log(`   ${h.对.padEnd(22)} ${String(h.串.length).padStart(3)}字  ${h.串.slice(0, 52)}`);
      汇总[h.对] = (汇总[h.对] || 0) + 1;
      明细.push({ 角色: n, ...h });
    }
  }
}

console.log(`\n══ 合计 ${总} 处 >=${MIN} 字共同子串 ══`);
if (总) {
  console.log('\n按条目对汇总：');
  Object.entries(汇总).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`   ${k.padEnd(24)} ${v}`));
  console.log('\n按角色汇总：');
  const byRole = {};
  for (const d of 明细) byRole[d.角色] = (byRole[d.角色] || 0) + 1;
  Object.entries(byRole).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`   ${k.padEnd(12)} ${v}`));
}
