// 校验本批新增的女性角色四件套是否符合契约。
// 用法: node src/兽血沸腾/tools/verify-female-batch.mjs
//
// 检查项：
//   A. 文件存在性（按组别应有几件）
//   B. 私密.yaml 的 15 个契约部位键齐全 + 阴唇独立 + 名器不撞名
//   C. 私密阶段.yaml 的 EJS 结构：首行 @@private、const 行、四分支、每支正好 6 键、档名不重复
//   D. 性格调色盘.yaml 的 EJS 结构：首行 @@private、四分支、底部无条件衍生、总结
//   E. 轴与阈值是否与预期表一致
//   F. 负面清单关键词（与 check-banned.mjs 同源的核心几条）
import fs from 'fs';
import path from 'path';

const ROLE = 'src/兽血沸腾/世界书/角色';

// 组别 → 应有文件
const A组 = ['幽月儿', '加茜娅', '伦娜', '费雯丽', '朝河兰', '珍妮佛', '波姬小丝', '赫莲娜'];
const B组 = ['喀秋莎', '茜茜', '姬丝凯碧', '安瑞达'];

const 应有 = {};
for (const n of A组) 应有[n] = ['基础信息.yaml', '性格调色盘.yaml', '私密.yaml', '私密阶段.yaml'];
for (const n of B组) 应有[n] = ['性格调色盘.yaml']; // 基础信息已存在
应有['安瑞达'].push('私密.yaml', '私密阶段.yaml');

// 预期阈值
const 预期阈值 = {
  幽月儿: [260, 460, 700], 加茜娅: [245, 419, 600], 伦娜: [300, 420, 560],
  费雯丽: [245, 419, 640], 朝河兰: [716, 728, 748], 珍妮佛: [140, 340, 600],
  波姬小丝: [630, 690, 740], 赫莲娜: [215, 340, 500], 安瑞达: [520, 650, 720],
  喀秋莎: [150, 400, 650], 茜茜: [350, 520, 663], 姬丝凯碧: [450, 560, 640],
};

// 15 个契约部位（与 extract-nsfw-parts.mjs 的 原装 一致）
const 原装 = ['奶子', '奶头', '乳晕', '逼', '阴唇', '阴蒂', '屁眼', '腰', '臀', '腿', '足', '手', '口', '腋', '发'];
const 异名 = { 阴唇: ['阴唇'], 腰: ['腰腹', '腰'], 臀: ['臀部', '臀'], 口: ['口舌', '口'], 腋: ['腋下', '腋'], 发: ['发肤', '发'] };

const 禁词 = [
  [/——/, '破折号'], [/似乎|几乎|仿佛|如同|宛如|好似|犹如/, '模糊比喻'],
  [/像小兽|投石入湖|心湖泛起|涟漪|嘴角微微上扬|眼中闪过一丝/, '陈旧意象'],
  [/陷入极大的恐惧|万念俱灰|心头一震|心中一凛|不由自主地|不禁/, '情绪套话'],
  [/不是[^，。]{1,20}，而是/, '否定转折'],
  [/他心想|她心想|心中暗道|暗自思忖|内心深处/, '过度心理'],
  [/本文将|本条目|如前所述|综上所述|值得注意的是/, '元叙事'],
  [/一个[^，。]{0,6}的存在|进行了一次|做出了一个/, '翻译腔'],
  [/待补|待确认|TODO|FIXME|XXX/, '占位符'],
];

const 报告 = [];
const 错 = [];
function bad(名, m) { 错.push(`${名}: ${m}`); }

// 已占用的名器名
const 已占名器 = new Set(['探骊得珠', '青玉绞珠', '九曲衔珠', '卧绵藏潮', '冻骨衔珠']);
const 本批名器 = new Map();

for (const [名, files] of Object.entries(应有)) {
  const dir = path.join(ROLE, 名);
  if (!fs.existsSync(dir)) { bad(名, '目录不存在'); continue; }

  // ── A. 存在性 ──
  const 缺 = files.filter(f => !fs.existsSync(path.join(dir, f)));
  if (缺.length) bad(名, `缺文件 ${缺.join(',')}`);

  // ── B. 私密.yaml ──
  const fp = path.join(dir, '私密.yaml');
  if (fs.existsSync(fp)) {
    const t = fs.readFileSync(fp, 'utf8');
    const 外观块 = t.match(/^外观:\s*$([\s\S]*?)(?=^\S)/m);
    if (!外观块) bad(名, '私密.yaml 找不到 外观: 顶层块');
    else {
      const 键 = [...外观块[1].matchAll(/^ {2}([^\s:#][^:]*):/gm)].map(m => m[1].trim());
      const 缺部位 = 原装.filter(c => !(异名[c] || [c]).some(k => 键.includes(k)));
      if (缺部位.length) bad(名, `外观缺部位 ${缺部位.join(',')}`);
      if (键.length < 8) bad(名, `外观键只有 ${键.length} 个（需 >= 8）`);
      if (!键.includes('阴唇')) bad(名, '阴唇 不是独立项');
      // 顶层必备段
      for (const seg of ['气味', '分泌物', '敏感带', '名器', '性癖']) {
        if (!new RegExp(`^${seg}:`, 'm').test(t)) bad(名, `私密.yaml 缺 ${seg}: 段`);
      }
    }
    const mo = t.match(/^\s*名目:\s*(.+)$/m);
    if (mo) {
      const nm = mo[1].trim().replace(/["'「」]/g, '');
      if (已占名器.has(nm)) bad(名, `名器名「${nm}」与既有名册撞名`);
      if (本批名器.has(nm)) bad(名, `名器名「${nm}」与 ${本批名器.get(nm)} 撞名`);
      本批名器.set(nm, 名);
      报告.push(`${名.padEnd(8)} 名器=${nm}`);
    } else bad(名, '私密.yaml 找不到 名器.名目');
  }

  // ── C. 私密阶段.yaml ──
  const ft = path.join(dir, '私密阶段.yaml');
  if (fs.existsSync(ft)) {
    const lines = fs.readFileSync(ft, 'utf8').split('\n');
    if (lines[0].trim() !== '@@private') bad(名, `私密阶段 首行不是 @@private（是「${lines[0].trim().slice(0, 20)}」）`);

    const ctrl = lines.map((l, i) => ({ l, i })).filter(x => /<%=?/.test(x.l));
    const 非法 = ctrl.filter(x => !/^\s*<%_\s.*\s_%>\s*$/.test(x.l));
    if (非法.length) bad(名, `私密阶段 有 ${非法.length} 行非 <%_ … _%> 控制行: ${非法.map(x => x.l.trim().slice(0, 30)).join(' | ')}`);

    // 轴与阈值
    const gv = fs.readFileSync(ft, 'utf8').match(/getvar\('([^']+)'/);
    const V = fs.readFileSync(ft, 'utf8').match(/const\s+(\w+)\s*=\s*getvar/)?.[1] ?? 'aff';
    if (!gv) bad(名, '私密阶段 无 getvar');
    else if (!gv[1].endsWith('剧情.章节序号')) bad(名, `私密阶段 轴不是 章节序号（是 ${gv[1]}）`);

    const 阈 = [...fs.readFileSync(ft, 'utf8').matchAll(new RegExp(`<%_\\s*(?:\\}\\s*else\\s+if|if)\\s*\\(\\s*${V}\\s*<\\s*(\\d+)\\s*\\)`, 'g'))].map(m => +m[1]);
    const exp = 预期阈值[名];
    if (exp && JSON.stringify(阈) !== JSON.stringify(exp)) bad(名, `私密阶段 阈值 ${阈.join('/')} ≠ 预期 ${exp.join('/')}`);

    // 每支 6 键 + 档名
    const 档 = [...fs.readFileSync(ft, 'utf8').matchAll(/^阶段:\s*(.+)$/gm)].map(m => m[1].trim());
    if (档.length !== 4) bad(名, `私密阶段 档名 ${档.length} 个（需 4）`);
    if (new Set(档).size !== 档.length) bad(名, `私密阶段 档名重复: ${档.join('/')}`);
    for (const k of ['边界', '身体状态', '反应', '台词', '落点']) {
      const c = [...fs.readFileSync(ft, 'utf8').matchAll(new RegExp(`^${k}:`, 'gm'))].length;
      if (c !== 4) bad(名, `私密阶段 ${k} 出现 ${c} 次（需 4）`);
    }
    // 分支数
    const br = [...fs.readFileSync(ft, 'utf8').matchAll(/<%_\s*(?:\}\s*else\s+if|if)\s*\(/g)].length;
    if (br !== 3) bad(名, `私密阶段 分支条件 ${br} 个（需 3）`);
  }

  // ── D. 性格调色盘.yaml ──
  const fc = path.join(dir, '性格调色盘.yaml');
  if (fs.existsSync(fc)) {
    const raw = fs.readFileSync(fc, 'utf8');
    const lines = raw.split('\n');
    if (lines[0].trim() !== '@@private') bad(名, `调色盘 首行不是 @@private（是「${lines[0].trim().slice(0, 20)}」）`);
    const ctrl = lines.filter(l => /<%=?/.test(l));
    const 非法 = ctrl.filter(l => !/^\s*<%_\s.*\s_%>\s*$/.test(l));
    if (非法.length) bad(名, `调色盘 有 ${非法.length} 行非 <%_ … _%> 控制行`);

    const gv = raw.match(/getvar\('([^']+)'/);
    const V = raw.match(/const\s+(\w+)\s*=\s*getvar/)?.[1] ?? 'chap';
    if (!gv) bad(名, '调色盘 无 getvar');
    else if (!gv[1].endsWith('剧情.章节序号')) bad(名, `调色盘 轴不是 章节序号（是 ${gv[1]}）`);
    const 阈 = [...raw.matchAll(new RegExp(`<%_\\s*(?:\\}\\s*else\\s+if|if)\\s*\\(\\s*${V}\\s*<\\s*(\\d+)\\s*\\)`, 'g'))].map(m => +m[1]);
    const exp = 预期阈值[名];
    if (exp && JSON.stringify(阈) !== JSON.stringify(exp)) bad(名, `调色盘 阈值 ${阈.join('/')} ≠ 预期 ${exp.join('/')}`);

    if (!/^底色:/m.test(raw)) bad(名, '调色盘 缺 底色（必须写在所有分支之外）');
    if (!/^对角色的理解与思考:/m.test(raw)) bad(名, '调色盘 缺 对角色的理解与思考:');
    if (!/^总结:\s*\|/m.test(raw)) bad(名, '调色盘 缺 总结: |');
    const br = [...raw.matchAll(/<%_\s*(?:\}\s*else\s+if|if)\s*\(/g)].length;
    if (br !== 3) bad(名, `调色盘 分支条件 ${br} 个（需 3）`);
    // 装饰器与内容之间不能有空行
    if (lines[1] !== undefined && lines[1].trim() === '') bad(名, '调色盘 装饰器后有空行');
    // 跨阶段比较
    if (/比(?:上|前|第)[一二三四]?(?:档|阶段)/.test(raw)) bad(名, '调色盘 出现跨阶段比较');
  }

  // ── F. 负面清单 ──
  for (const f of files) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) continue;
    const t = fs.readFileSync(p, 'utf8');
    for (const [re, tag] of 禁词) if (re.test(t)) bad(名, `${f} 命中「${tag}」`);
    const hashes = t.split('\n').filter(l => /^\s*#/.test(l));
    if (hashes.length) bad(名, `${f} 有 ${hashes.length} 行 # 注释`);
  }
}

// 安瑞达形体裁定：不得出现未成年词
for (const 名 of ['安瑞达']) {
  for (const f of 应有[名] || []) {
    const p = path.join(ROLE, 名, f);
    if (!fs.existsSync(p)) continue;
    const t = fs.readFileSync(p, 'utf8');
    for (const w of ['小女孩', '幼女', '小小的个子', '稚嫩', '小脸', '娇小']) {
      if (t.includes(w)) bad(名, `${f} 出现禁用词「${w}」（安瑞达按成年女性写）`);
    }
  }
}

console.log('══ 名器 ══');
报告.forEach(r => console.log('  ' + r));
console.log(`\n══ 结果 ══`);
if (!错.length) console.log('  ✓ 全部通过');
else { console.log(`  ✗ ${错.length} 处问题：`); 错.forEach(e => console.log('   - ' + e)); }
