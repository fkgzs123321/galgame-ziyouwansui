// 语料归属 v14（终版）：以「人名 → 引语」之间的间隔段收尾于言说动词为归属依据
//
// v13 要求言说动词**紧接**人名，因此漏掉了「娜娜浮在空中笑道：」这类
// 「人名 + 动作短语 + 言说动词」的常见句式，导致把娜娜的台词留在了「寇涛」条目里。
// v14 改为：
//   对人名 at，取 gap = 人名之后到引语之前的那一段。
//   归属成立 ⇔ gap 内不含其它人名 ∧ gap 长度 ≤ 34 ∧ gap 去掉尾随标点后以言说动词收尾。
//   反向（人名在引语之后）同样处理。
// 判定仍取「离引语最近且归属成立的具名人」：是本人→保留；是别人→删除；无→保留（不做无证据删除）。
//
// 用法：node fix-npc-quotes14.mjs        仅审计
//       node fix-npc-quotes14.mjs --fix  删除错挂
import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
const FIX = process.argv.includes('--fix');
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');

const NAMES = new Set();
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml'))) NAMES.add(f.replace(/\.yaml$/, ''));
for (const f of fs.readdirSync('src/兽血沸腾/世界书/角色', { withFileTypes: true })) if (f.isDirectory()) NAMES.add(f.name);
['刘震撼', '刘震憾', '李察', '李察.基尔', '老刘', '凝玉', '艾薇尔', '艾薇儿', '海伦', '果果', '壹条',
 '小空', '卡卡', '贞德', '嘉宝', '梦露', '黛丝', '若尔娜', '崔蓓茜', '歌坦妮', '歌莉妮', '莉莉', '谭雅',
 '艾莉婕', '许德拉', '阿仙奴', '唐蓓尔金娜', '白素青', '安度兰', '穆里尼奥', '隆美尔', '古德',
 '贝克汉姆', '维埃里', '贝拉米', '科里纳', '奥尼尔', '罗德曼', '菲高', '贝肯鲍尔', '冬五',
 '娜娜', '扬科勒', '贝斯特', '罗比尼奥', '美帅', '布拉特', '卡鲁', '拉莫斯', '依莎贝拉',
 '美女蛇导师', '齐丹', '特使', '亲王', '大萨满'].forEach(n => NAMES.add(n));
const NAME_LIST = [...NAMES].filter(n => n.length >= 2).sort((a, b) => b.length - a.length);

// 言说动词（收尾判定用）：既含多字，也含单字
const SAY = '说道|笑道|喊道|问道|答道|怒道|叫道|哼道|叹道|冷笑道|开口道|接口道|大笑道|苦笑道|正色道|补充道|继续道|解释道|回答道|反问道|宣布道|总结道|嘟囔道|嘀咕道|自语道|呢喃道|咕哝道|沉声道|轻声道|朗声道|笑骂道|嗔道|喝道|骂道|念叨|笑|说|叫|问|答|哼|叹|喊|喝|骂|道|开口|插口|接口|接道|补充|解释|回答|反问|宣布|感慨|嘟囔|嘀咕|自语|呢喃|咕哝|开口说|继续说';
const SAY_END = new RegExp(`(?:${SAY})$`);
const TITLE = '大人|陛下|殿下|长老|大师|阁下|侯爵|伯爵|亲王|团长|将军|小姐|夫人|女士|族长|酋长|城主|主母|导师|老师|先生|太太|老爷|阿姨|叔叔|姐姐|哥哥|大萨满|主祭|大祭司|霓下|萨满|祭祀|领主|总督|大公|公爵|王子|公主|爵士|队长|首领|魔导师|大魔导师|圣骑士|龙骑士|先知|神使|导师';
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PREP = '对向朝和跟同与为给让使';

const BAD = [/^[\w\s]*e书|首发|整理/, /^["“]?[\u4e00-\u9fa5]{2,10}领域$/, /^海尔/, /^布鲁斯柯/,
  /^奉.{0,10}之命/, /^魔攻能力/, /^我来说～/, /〔|【/, /^[嗯恩哦啊]+[，。]?$/, /…………$/];

function mask(text) {
  let out = '', i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '\u201C' || c === '"') {
      const close = text.indexOf('\u201D', i + 1);
      if (close < 0) { out += '·'.repeat(text.length - i); break; }
      out += c + '·'.repeat(close - i - 1) + '\u201D';
      i = close + 1; continue;
    }
    out += c; i++;
  }
  return out;
}
const namesIn = s => NAME_LIST.filter(nm => s.includes(nm));

// 从「人名之后的一段」判断是否为言说归属
function isAttrGap(gap) {
  if (gap.length > 34) return false;
  if (namesIn(gap).length) return false;                     // 中间夹着别人 → 不是它说话
  const g = gap.replace(/[”"：:，,。！？…\s]+$/g, '');        // 去掉尾随标点
  if (!g) return false;
  if (SAY_END.test(g)) return true;
  // 「人名 + 称谓 + 道」等
  const t = new RegExp(`(?:${TITLE})$`);
  if (t.test(g)) return false;
  return false;
}

function speakersIn(text) {
  const res = [];
  for (const nm of NAME_LIST) {
    let from = 0;
    for (;;) {
      const at = text.indexOf(nm, from);
      if (at < 0) break;
      from = at + 1;
      const pre = text.slice(Math.max(0, at - 3), at);
      if (new RegExp(`[${PREP}]$`).test(pre)) continue;      // 宾语/受话人位
      res.push({ name: nm, idx: at, end: at + nm.length });
    }
  }
  return res.sort((a, b) => a.idx - b.idx);
}

const sameish = (a, b) => a === b || a.includes(b) || b.includes(a);

function selfId(name, q, aliases) {
  for (const v of [name, ...aliases]) {
    if (v.length < 2) continue;
    if (new RegExp(`(?:我|本|俺|老[子爷])[，,]?\\s*${esc(v)}`).test(q)) return true;
    if (new RegExp(`(?:我就是|我是|我叫|我乃|在下|鄙人|本人)\\s*[^，。；！？]{0,8}${esc(v)}`).test(q)) return true;
    if (new RegExp(`(?:您)?(?:最)?忠实的仆人\\s*${esc(v)}`).test(q)) return true;
  }
  return false;
}

function aliasesOf(src) {
  const raw = (src.match(/^  姓名: (.*)$/m) || [, ''])[1];
  const base = raw.split(/又称/)[0].trim();
  const all = raw.split(/又称|，|,|\//).map(s => s.trim());
  return [...new Set([base, ...all])].filter(s => s.length >= 2);
}

const norm = s => s.replace(/\s+/g, '');
const INDEX = new Map();
lines.forEach((l, li) => {
  for (const m of l.matchAll(/[“"]([^“”"]{8,95})[”"]/g)) {
    const key = norm(m[1]).slice(0, 12);
    if (!INDEX.has(key)) INDEX.set(key, []);
    INDEX.get(key).push({ li, qs: m.index, qe: m.index + m[0].length, q: m[1] });
  }
});

function verdict(name, aliases, q) {
  const key = norm(q).slice(0, 12);
  for (const sp of INDEX.get(key) || []) {
    if (!norm(sp.q).trim().startsWith(key)) continue;
    if (selfId(name, sp.q, aliases)) return 'own';
    const l = lines[sp.li];
    const P = mask(l.slice(0, sp.qs)), A = mask(l.slice(sp.qe));
    const cands = [];
    for (const s of speakersIn(P)) if (isAttrGap(P.slice(s.end, sp.qs))) cands.push({ name: s.name, d: sp.qs - s.idx });
    for (const s of speakersIn(A)) if (isAttrGap(A.slice(0, s.idx))) cands.push({ name: s.name, d: s.idx });
    if (!cands.length) continue;
    cands.sort((a, b) => a.d - b.d);
    const v = cands[0].name;
    if (aliases.some(x => sameish(v, x))) return 'own';
    return { other: v };
  }
  return 'unknown';
}

let nOther = 0, nUnknown = 0;
const detail = [];
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml')).sort()) {
  const n = f.replace(/\.yaml$/, '');
  const p = path.join(NPC, f);
  let t = fs.readFileSync(p, 'utf8');
  const al = aliasesOf(t);
  const m = t.match(/^  参考语料:\n((?:    - .*\n?)*)/m);
  if (!m) continue;
  const have = [...m[1].matchAll(/^    - (.*)$/gm)].map(x => {
    try { return JSON.parse(x[1]); } catch { return x[1].replace(/^"|"$/g, ''); }
  });
  const keep = [], drop = [];
  for (const q of have) {
    const v = verdict(n, al, q);
    if (v && v.other) { drop.push({ q, who: v.other }); nOther++; }
    else { keep.push(q); if (v === 'unknown') nUnknown++; }
  }
  if (!drop.length) continue;
  detail.push({ n, drop, left: keep.length });
  if (!FIX) continue;
  if (keep.length === 0) t = t.replace(/^  参考语料:\n(?:    - .*\n?)*/m, '');
  else t = t.replace(/^  参考语料:\n(?:    - .*\n?)*/m,
    `  参考语料:\n` + keep.map(q => `    - ${JSON.stringify(q)}`).join('\n') + '\n');
  fs.writeFileSync(p, t.replace(/\n+$/, '\n'), 'utf8');
}

console.log(`模式：${FIX ? '已删除错挂' : '仅审计'}`);
console.log(`高置信错挂：${nOther} 条 / ${detail.length} 个文件；无线索保留：${nUnknown} 条\n`);
for (const r of detail) {
  console.log(`\n【${r.n}】删 ${r.drop.length}，留 ${r.left}`);
  for (const d of r.drop) console.log(`   ${d.who}｜${d.q.slice(0, 58)}`);
}
