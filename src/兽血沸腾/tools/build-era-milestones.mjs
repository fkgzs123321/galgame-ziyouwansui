// 从 故事大纲.yaml 的 chapters[].notes 里抽取每个角色的纪元里程碑。
// 输出 tools/era-milestones.json：角色 → [{idx, 事件短语, 命中词}]
// 依据：outline 的章号是每卷重排的，不可用于索引；因此用 chapters: 数组的**序号**
// 与 line-to-idx.json 的 idx 对齐（chapters 数组顺序 == 去重章顺序，已验证 764 项）。
import fs from 'fs';

const DAGANG = 'src/兽血沸腾/故事大纲.yaml';
const raw = fs.readFileSync(DAGANG, 'utf8');
const L = raw.split('\n');

// ── 1. 解析 chapters 数组（只取 name / notes 两键）──
const start = L.findIndex(l => /^chapters:/.test(l));
const chaps = [];
let cur = null;
for (let i = start + 1; i < L.length; i++) {
  const l = L[i];
  if (/^\S/.test(l)) break;                       // 回到顶层键
  const m = l.match(/^\s{2}- name:\s*(.*)$/);
  if (m) { if (cur) chaps.push(cur); cur = { name: m[1].trim(), notes: '' }; continue; }
  const n = l.match(/^\s{4}notes:\s*(.*)$/);
  if (n && cur) { cur.notes = n[1].trim(); continue; }
  const c = l.match(/^\s{4}(context|characters|items|key_points):\s*(.*)$/);
  if (c && cur) cur.notes += ' ' + c[2].trim();
}
if (cur) chaps.push(cur);

console.log(`chapters 数组 ${chaps.length} 项`);

// ── 2. idx 的定义 ──
// idx == chapters 数组下标。故事大纲.yaml 的 chapters 顺序就是权威去重章顺序（764 项），
// 也就是「剧情.章节序号」的取值域 0..763。旧版拿 line-to-idx.json 的 idx 去查是错的：
// 该文件只到 743，且它的 idx 由「数组下标 == 标题序号」的错误假设生成。
const N = chaps.length;
const 章线 = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
const 线 = new Map(章线.map(c => [c.idx, c.line]));
console.log(`idx 取值域 0..${N - 1}（chapters 数组下标即 idx）`);

// ── 3. 里程碑模式表 ──
// 每条 = {提示词, 事件缩写}；命中即记一笔
const PAT = [
  [/转职|晋级|加冕|获封|受封|册封|品阶|升为|封为|推上/, '晋级/加冕'],
  [/学院|院长|剑桥/, '剑桥/学院'],
  [/婚礼|成亲|结发|完婚|嫁|娶|妻子|妻室|入洞房|花冠|初夜/, '婚姻'],
  [/怀孕|珠胎|有孕|身孕|诞下|生子|生女|产下|子嗣/, '生育'],
  [/战死|阵亡|殉|牺牲|死去|身亡|陨落/, '死亡'],
  [/救|救下|救出|初遇|相遇|相识|邂逅/, '初遇/救助'],
  [/拜师|收徒|导师|学徒|师从/, '师徒'],
  [/魔宠|契约|签下/, '魔宠'],
  [/领|封地|上任|任命|调任|赴任/, '职务'],
  [/背叛|反目|决裂|闹翻|出走|离开/, '关系变动'],
  [/决战|决战|主战场|总攻|入侵|宣战/, '战局'],
];

// ── 4. 角色名册：用 era-table.json 里的人名，外加手工别名 ──
const era = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-table.json', 'utf8'));
const names = [...new Set(era.表.map(r => r.名))];
const ALIAS = {
  '海伦.列娜': ['海伦'], '崔蓓茜': ['崔蓓茜', '崔蓓西'], '艾薇尔': ['艾薇尔', '艾薇儿'],
  '刘震撼': ['刘震撼', '李察'], '凝玉': ['凝玉'], '黛丝': ['黛丝'], '若尔娜': ['若尔娜'],
  '歌坦妮': ['歌坦妮'], '贞德': ['贞德'], '白素青': ['白素青'], '谭雅': ['谭雅', '珊瑚美人'],
  '阿仙奴': ['阿仙奴'], '许德拉': ['许德拉'], '歌莉妮': ['歌莉妮', '莉莉'], '唐蓓尔金娜': ['唐蓓尔金娜'],
  '梦露': ['梦露'], '嘉宝': ['嘉宝'], '艾莉婕': ['艾莉婕'], '幽月儿': ['幽月儿'],
  '加茜娅': ['加茜娅'], '伦娜': ['伦娜'], '费雯丽': ['费雯丽'], '朝河兰': ['朝河兰'],
  '珍妮佛': ['珍妮佛'], '波姬小丝': ['波姬小丝'], '赫莲娜': ['赫莲娜', '赫莲娜.索菲亚'],
  '安瑞达': ['安瑞达'], '喀秋莎': ['喀秋莎'], '茉儿': ['茉儿', '苿儿'], '茜茜': ['茜茜'],
  '姬丝凯碧': ['姬丝凯碧'], '穆里尼奥': ['穆里尼奥'], '隆美尔': ['隆美尔'],
  '李察王子': ['李察王子', '李察.萨尔'], '安度兰长老': ['安度兰'], '普斯卡什': ['普斯卡什'],
  '壹条': ['壹条'], '果果': ['果果'], '海华丝': ['海华丝', '丽塔.海华丝'],
};

// ── 5. 扫描 ──
const out = {};
for (const nm of names) {
  const keys = ALIAS[nm] ?? [nm];
  const hits = [];
  for (let i = 0; i < N; i++) {
    const t = chaps[i].notes;
    if (!t) continue;
    const k = keys.find(x => t.includes(x));
    if (!k) continue;
    const evs = PAT.filter(([re]) => re.test(t)).map(([, tag]) => tag);
    hits.push({ idx: i, 行: 线.get(i) ?? null, 章: chaps[i].name, 事件: [...new Set(evs)], 摘: t.slice(0, 150) });
  }
  if (hits.length) out[nm] = hits;
}

const 有 = Object.keys(out);
console.log(`\n抽到里程碑的角色 ${有.length} / ${names.length}`);
const 计数 = 有.map(n => [n, out[n].length]).sort((a, b) => b[1] - a[1]);
console.log('命中数 Top 20: ' + 计数.slice(0, 20).map(([n, c]) => `${n}(${c})`).join(' '));
console.log('命中数 Bottom 10: ' + 计数.slice(-10).map(([n, c]) => `${n}(${c})`).join(' '));

// 抽样验证：海伦
for (const nm of ['海伦.列娜', '崔蓓茜', '艾薇尔']) {
  console.log(`\n══ ${nm} 里程碑（前 18）══`);
  for (const h of (out[nm] ?? []).slice(0, 18))
    console.log(`  idx${String(h.idx).padStart(4)} L${String(h.行).padStart(6)} [${h.事件.join(',') || '—'}] 《${h.章}》 ${h.摘.slice(0, 96)}`);
}

fs.writeFileSync('src/兽血沸腾/tools/era-milestones.json', JSON.stringify(out, null, 2), 'utf8');
console.log('\n→ 已写 tools/era-milestones.json');
