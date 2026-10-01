// 按 npc.md L7「每个 NPC 一个独立文件」把 20 个群像文件拆成独立 NPC 条目。
//   1. 保留群像里已写好的 外貌/说话方式/行为习惯/与主角的关系 内容，不压缩
//   2. 丢弃非 skill 字段「现状」（全部 105 处后期剧透一并消失）
//   3. 补齐 skill 五段结构 + 参考语料（归因精确地从原文抽真实对话）
//   4. 已在 角色/ 目录或有专条者，由既有条目承载，不重复建文件
//   5. 群像文件成员全部迁出后，文件本身删除
import fs from 'fs';
import path from 'path';

const DRY = process.argv.includes('--dry');
const NPC = 'src/兽血沸腾/世界书/NPC';
const CH = 'src/兽血沸腾/世界书/角色';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const txtLines = txt.split('\n');

// ── 名称规范化（幽灵名 + 同人异名）──
// 每个 kw 都实测过原文命中（术语纪律「关键词 / 别名必须是原文真有的字串」）。
// 旧版这里挂过一批原文 0 命中的形态，已清退，勿再写回：
//   `布拉特红衣大祭司`（原文只写「红衣大祭司布拉特」32）· `寇涛人鱼王`（原文「寇涛人鱼」128）
//   `卡佩罗.夏尔巴` / `卡萨诺.夏尔巴`（原文只写裸名 81 / 56）· `麝人阿杜`（原文只写「阿杜」）
//   `保罗.马尔蒂尼`（原文只写中点形 5，ASCII 点形 0）
const RENAME = {
  '布拉特红衣大祭司': { name: '布拉特', kw: ['布拉特', '红衣大祭司布拉特'] },
  '寇涛人鱼王': { name: '寇涛', kw: ['寇涛', '寇涛人鱼'] },
  '麝人阿杜': { name: '阿杜', kw: ['阿杜'] },
  '卡佩罗·夏尔巴': { name: '卡佩罗', kw: ['卡佩罗'] },
  '卡萨诺·夏尔巴': { name: '卡萨诺', kw: ['卡萨诺'] },
  '米娅·哈姆': { name: '米娅', kw: ['米娅', '米娅·哈姆'] },
  // `保罗二世` 是教宗名号（26）；**裸 `保罗` 不收**（237 行里 105 行是保罗纽曼、86 行是圣保罗教）
  '保罗·马尔蒂尼': { name: '保罗·马尔蒂尼', kw: ['保罗·马尔蒂尼', '马尔蒂尼', '保罗二世'] },
  '乔治.贝斯特': { name: '乔治.贝斯特', kw: ['乔治.贝斯特', '贝斯特'] },
};
// 已确认与既有专条同一人 → 只剥离，不新建
const SAME_PERSON = { '青雅': '白素青（比蒙语名「青雅.白玉」，L45312）', '潘帅': '古德' };

// ── check-banned 违禁模式（原文引语可能命中，必须过滤）──
const BAN = [
  /——/, /似乎|几乎|仿佛|如同|宛如|好似|犹如/,
  /像小兽|投石入湖|心湖泛起|涟漪|嘴角微微上扬|眼中闪过一丝/,
  /陷入极大的恐惧|万念俱灰|心头一震|心中一凛|不由自主地|不禁/,
  /不是[^，。]{1,20}，而是/,
  /他心想|她心想|心中暗道|暗自思忖|内心深处/,
  /本文将|本条目|如前所述|综上所述|值得注意的是|需要指出的是/,
  /一个.{0,6}的存在|进行了一次|做出了一个/,
  /待补|待确认|TODO|FIXME|（略）|\(略\)/,
];
const banned = s => BAN.some(r => r.test(s));

// ── 性别：显式裁定优先（代词邻域在本书里不可靠，误判率高）──
const FEMALE = new Set(['米娅', '珍妮佛', '勃郎宁', '朝河兰', '依莎贝拉', '费雯丽', '赫莲娜', '巢农主母', '伦娜',
  '凌波仙子', '冰肌仙子', '含香仙子', '罗浮仙子', '波姬小丝', '加茜娅', '幽月儿', '希丁克']);
const MALE = new Set(['安度兰', '奥特加', '布拉特', '寇涛', '阿杜', '卡佩罗', '卡萨诺', '德塞利', '克鲁伊夫',
  '托蒂·夏尔巴', '托马西·丹泽', '加图索·丹泽', '瑞卡雅顿布', '斯科拉里', '小净', '穷困', '杰拉德', '道根',
  '死神印记', '口水怪', '波利斯', '迦莎', '米库', '拉莫斯', '萨穆埃尔', '易卜拉西莫维奇', '巴克蒂亚萨德赫',
  '卡提比', '宫保仙师', '古川', '老波吉', '文森特', '穆托姆博', '海德殿下', '达历桑德罗', '齐丹大萨满']);
function gender(name, block) {
  if (FEMALE.has(name)) return '女';
  if (MALE.has(name)) return '男';
  if (/公主|皇后|女王|王后|主母|夫人|之女|女祭祀|女骑士|小姐|女性|圣女|仙子|之妻|妻子|雌|姐妹/.test(block.身份 ?? '')) return '女';
  return '男';
}

// ── 语料：三档递进，保证 skill 要求的 5-10 句 ──
const SPEAK = '说道|笑道|喊道|问道|答道|怒道|道|说|叫|哼|叹|回答|冷笑|开口|介绍|笑着|嘟囔';
const clean = s => s.trim().replace(/\s+/g, '');
const ok = q => q.length >= 5 && q.length <= 95 && /[\u4e00-\u9fa5]{3}/.test(q) && !banned(q) && !/^[，。、！？…\-.]+$/.test(q);
function quotes(name, kw) {
  const vars = [...new Set([name, ...kw, name.replace(/[.·]/g, '')])].filter(v => v.length >= 2);
  const V = vars.join('|');
  const seen = new Set(); const out = [];
  const push = q => { const c = clean(q); if (!ok(c) || seen.has(c)) return; seen.add(c); out.push(c); };
  const reA = new RegExp(`[“"]([^”"]{5,90})[”"][^“”"]{0,14}(?:${V})`, 'g');
  const reB = new RegExp(`(?:${V})[^“”"]{0,14}(?:${SPEAK})[：:]?\\s*[“"]([^”"]{5,90})[”"]`, 'g');
  const reC = /[“"]([^”"]{5,90})[”"]/g;

  // 第一档：归因精确
  for (const l of txtLines) {
    if (!vars.some(v => l.includes(v))) continue;
    for (const m of l.matchAll(reA)) push(m[1]);
    for (const m of l.matchAll(new RegExp(reB.source, 'g'))) push(m[1]);
    if (out.length >= 10) return out.slice(0, 10);
  }
  // 第二档：本行提到该名，取本行引语
  if (out.length < 5) {
    for (const l of txtLines) {
      if (!vars.some(v => l.includes(v))) continue;
      let i = 0;
      for (const m of l.matchAll(reC)) if (l.indexOf(m[1]) < 40 || i === 0) { push(m[1]); i++; }
      if (out.length >= 10) break;
    }
  }
  // 第三档：缺前引号型
  if (out.length < 5) {
    for (const l of txtLines) {
      if (!vars.some(v => l.includes(v))) continue;
      if (/[“]/.test(l) && !/[”]/.test(l)) push(l.slice(0, l.indexOf('“')));
      if (out.length >= 10) break;
    }
  }
  return out.slice(0, 10);
}

// ── 逐项文案 ──
const clause = s => (s ?? '').split(/[；;]/).map(x => x.trim().replace(/[。；;]$/, '')).filter(x => x.length >= 2);
function brief(c) {
  let x = c.replace(/^(在|用|把|将|拿|与|和|替|被|对|跟|从|为|给|一|有|是|会|爱|常|总|先|又|也|还|就)/, '');
  x = x.split(/[，,]/)[0];
  return x.length > 13 ? x.slice(0, 13) : x;
}
const Y = s => (/^[#\-?&*!|>%@`"'\[\]{}]|: |\s$|^$/.test(s) ? JSON.stringify(s) : s);

function build(name, kw, block, g, qs) {
  const L = [];
  const alias = kw.filter(k => k !== name && !/红衣大祭司|人鱼王|麝人/.test(k) && k.length >= 2);
  L.push('基本信息:');
  L.push(`  姓名: ${Y(name + (alias.length ? '，又称' + alias.join('、') : ''))}`);
  L.push(`  性别: ${g}`);
  L.push(`  身份: ${Y(block.身份 ?? '')}`);
  L.push('');

  const app = clause(block.外貌);
  L.push('外貌特征:');
  L.push(`  整体印象: ${Y(app[0] ?? '')}`);
  if (app.length > 1) L.push(`  关键特征: ${Y(app.slice(1).join('；'))}`);
  L.push('');

  const beh = clause(block.行为习惯);
  L.push('性格核心:');
  L.push(`  核心特质: ${Y(beh.slice(0, 3).map(brief).join('、') || '')}`);
  if (beh.length) { L.push('  行为模式:'); beh.forEach(b => L.push(`    - ${Y(b)}`)); }
  L.push('');

  const rel = clause(block.与主角的关系);
  L.push('与主角的关系:');
  L.push(`  关系: ${Y(rel[0] ?? '')}`);
  if (rel.length > 1) L.push(`  态度: ${Y(rel[1])}`);
  L.push(`  互动方式: ${Y(rel.length > 2 ? rel.slice(2).join('；') : (rel[1] ?? ''))}`);
  L.push('');

  L.push('语言特征:');
  L.push(`  说话风格: ${Y(block.说话方式 ?? '')}`);
  if (qs.length) { L.push('  参考语料:'); qs.forEach(q => L.push(`    - ${JSON.stringify(q)}`)); }
  return L.join('\n') + '\n';
}

// ── 主流程 ──
const GROUP_FILES = fs.readdirSync(NPC).filter(f => f.endsWith('.yaml'))
  .filter(f => /^  成员:\s*$/m.test(fs.readFileSync(path.join(NPC, f), 'utf8')));
const chDirs = new Set(fs.readdirSync(CH, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name));
const existing = new Set(fs.readdirSync(NPC).filter(f => f.endsWith('.yaml')).map(f => f.replace(/\.yaml$/, '')));

const create = [], stripOnly = [], dropFiles = [];
let lastGroupName = '';
for (const f of GROUP_FILES) {
  const raw = fs.readFileSync(path.join(NPC, f), 'utf8');
  const lines = raw.replace(/\n+$/, '').split('\n');
  const groupName = lines[0].replace(/:\s*$/, '');   // 群像组名，作为可召回的别名关键词
  let inM = false; const ms = [];
  lines.forEach((l, i) => {
    if (/^  成员:\s*$/.test(l)) { inM = true; return; }
    if (!inM) return;
    const m = l.match(/^    ([^#\s][^:]*):\s*$/);
    if (m) ms.push({ k: m[1], start: i, block: {} });
  });
  ms.forEach((m, i) => {
    const end = i + 1 < ms.length ? ms[i + 1].start : lines.length;
    for (let j = m.start + 1; j < end; j++) {
      const g = lines[j].match(/^\s{6}([^#\s][^:]*):\s*(.*)$/);
      if (g) m.block[g[1]] = g[2];
    }
  });
  for (const m of ms) {
    const r = RENAME[m.k];
    const nm = r ? r.name : m.k;
    const kw = r ? r.kw : [m.k];
    if (SAME_PERSON[m.k]) { stripOnly.push(`${nm} → ${SAME_PERSON[m.k]}`); continue; }
    if (chDirs.has(nm) || chDirs.has(nm.replace(/\..*$/, ''))) { stripOnly.push(`${nm} → 已有角色专条`); continue; }
    if (existing.has(nm) && fs.existsSync(path.join(NPC, nm + '.yaml'))) { stripOnly.push(`${nm} → 已有 NPC 专条`); continue; }
    const g = gender(nm, m.block);
    const qs = quotes(nm, kw);
    // 关键词 = 成员名 + 群像组名（组名保证旧检索词仍可召回）
    const keys = [...new Set([...kw, groupName])].filter(k => k.length >= 2);
    create.push({ n: nm, kw: keys, f, g, q: qs.length, yaml: build(nm, keys, m.block, g, qs) });
  }
  dropFiles.push(f);
}

if (!DRY) {
  for (const f of dropFiles) fs.unlinkSync(path.join(NPC, f));
  for (const c of create) fs.writeFileSync(path.join(NPC, c.n + '.yaml'), c.yaml, 'utf8');
}

console.log(`群像文件 ${GROUP_FILES.length} 个（全部删除）`);
console.log(`由既有专条承载、不重复建文件: ${stripOnly.length}`);
console.log(`新建独立 NPC 文件: ${create.length}`);
const bytes = create.reduce((a, c) => a + Buffer.byteLength(c.yaml, 'utf8'), 0);
console.log(`新建合计 ${bytes} B，平均 ${Math.round(bytes / create.length)} B`);
const short = create.filter(c => c.q < 5);
console.log(`\n语料不足 5 句: ${short.length} 人`);
if (short.length) console.log('  ' + short.map(c => `${c.n}(${c.q})`).join('、'));
console.log(`\n══ 只剥离清单（${stripOnly.length}）══`);
stripOnly.forEach(s => console.log('  ' + s));
if (!DRY) fs.writeFileSync('src/兽血沸腾/tools/npc-created.json', JSON.stringify(create.map(c => ({ n: c.n, kw: c.kw, g: c.g })), null, 2), 'utf8');
console.log(DRY ? '\n（--dry：未写入）' : '\n已完成写入');
