import fs from 'fs';

const P = 'src/兽血沸腾/tavern-cards-state.json';
const st = JSON.parse(fs.readFileSync(P, 'utf8'));
const roles = st.entryManifest['角色'];
const log = [];

// ① 艾薇尔：去重（fix-avier.mjs 把 艾薇儿 改名后留下重复项）
for (const n of ['艾薇尔_基础信息', '艾薇尔_性格调色盘']) {
  const l = roles[n];
  const before = [...l.keywords];
  l.keywords = [...new Set(l.keywords)];
  if (l.strategy?.keys) l.strategy.keys = [...new Set(l.strategy.keys)];
  log.push(`[去重] ${n}: ${JSON.stringify(before)} -> ${JSON.stringify(l.keywords)}`);
}

// ② 海伦.列娜：把错挂的「天鹅女骑士」（原文指歌坦妮，67 处；L15482 小狐狸与天鹅女骑士并列）
//    换成原文实有的别名「海伦祭祀」(13) 与「小狐狸精」(345)
for (const n of ['海伦.列娜_基础信息', '海伦.列娜_性格调色盘']) {
  const l = roles[n];
  if (!l) continue;
  const before = [...l.keywords];
  l.keywords = l.keywords.filter(k => k !== '天鹅女骑士');
  for (const k of ['海伦祭祀', '小狐狸精']) if (!l.keywords.includes(k)) l.keywords.push(k);
  if (l.strategy?.keys) l.strategy.keys = [...l.keywords];
  log.push(`[改正] ${n}: ${JSON.stringify(before)} -> ${JSON.stringify(l.keywords)}`);
}

// ③ 歌坦妮：补上原文实有称呼「天鹅女骑士」，本就属于她
for (const n of ['歌坦妮_基础信息']) {
  const l = roles[n];
  const before = [...l.keywords];
  if (!l.keywords.includes('天鹅女骑士')) l.keywords.push('天鹅女骑士');
  if (l.strategy?.keys) l.strategy.keys = [...l.keywords];
  log.push(`[补齐] ${n}: ${JSON.stringify(before)} -> ${JSON.stringify(l.keywords)}`);
}

// ④ 艾薇尔：补上原文实有称谓「美人鱼公主」(68) / 「人鱼公主」(124)
for (const n of ['艾薇尔_基础信息', '艾薇尔_性格调色盘']) {
  const l = roles[n];
  const before = [...l.keywords];
  for (const k of ['美人鱼公主', '西雅海国']) if (!l.keywords.includes(k)) l.keywords.push(k);
  if (l.strategy?.keys) l.strategy.keys = [...l.keywords];
  log.push(`[补齐] ${n}: ${JSON.stringify(before)} -> ${JSON.stringify(l.keywords)}`);
}

fs.writeFileSync(P, JSON.stringify(st, null, 2) + '\n', 'utf8');
console.log(log.join('\n'));
