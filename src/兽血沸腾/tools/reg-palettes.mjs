import fs from 'fs';

const STATE = 'src/兽血沸腾/tavern-cards-state.json';
const st = JSON.parse(fs.readFileSync(STATE, 'utf8'));
const roles = st.entryManifest['角色'];

// 每个角色的 abstract 与 keywords。keywords 必须：非重复、≥2 汉字、归属该角色。
const PLAN = [
  { name: '黛丝_性格调色盘', after: '黛丝_基础信息', kw: ['黛丝', '仙女龙', '智谋', '龙族'], abs: '黛丝的性格调色盘：好感度分四阶段的底色、主色调、点缀与衍生' },
  { name: '若尔娜_性格调色盘', after: '若尔娜_基础信息', kw: ['若尔娜', '仙女龙', '炼金', '魔法阵'], abs: '若尔娜的性格调色盘：好感度分四阶段的底色、主色调、点缀与衍生' },
  { name: '崔蓓茜_性格调色盘', after: '崔蓓茜_基础信息', kw: ['崔蓓茜', '崔蓓西', '妮可', '美杜莎'], abs: '崔蓓茜的性格调色盘：好感度分四阶段的底色、主色调、点缀与衍生' },
  { name: '歌坦妮_性格调色盘', after: '歌坦妮_基础信息', kw: ['歌坦妮', '天鹅女骑士', '斯迈族', '铁十字兽'], abs: '歌坦妮的性格调色盘：好感度分四阶段的底色、主色调、点缀与衍生' },
  { name: '果果_性格调色盘', after: '果果_基础信息', kw: ['果果', '霜雪皮丘兽', '魔宠'], abs: '果果的性格调色盘：忠诚度分三阶段的底色、主色调、点缀与衍生' },
  { name: '壹条_性格调色盘', after: '壹条_基础信息', kw: ['壹条', '火鹤', '博浪沙'], abs: '壹条的性格调色盘：忠诚度分三阶段的底色、主色调、点缀与衍生' },
  { name: '安度兰长老_性格调色盘', after: '安度兰长老_基础信息', kw: ['安度兰长老', '安度兰', '冰霜巨龙', '玳瑁族'], abs: '安度兰长老的性格调色盘：单阶段的底色、主色调、点缀与衍生' },
  { name: '茉儿_性格调色盘', after: '茉儿_基础信息', kw: ['茉儿', '蝴蝶人', '潮汐祭祀'], abs: '茉儿的性格调色盘：好感度分四阶段的底色、主色调、点缀与衍生' },
  { name: '隆美尔_性格调色盘', after: '隆美尔_三面性', kw: ['隆美尔', '慕兰帝国', '美帅'], abs: '隆美尔的性格调色盘：单阶段的底色、主色调、点缀与衍生' },
  { name: '李察王子_性格调色盘', after: '李察王子_三面性', kw: ['李察王子', '圣殿骑士', '格雷克.萨尔'], abs: '李察王子的性格调色盘：单阶段的底色、主色调、点缀与衍生' },
];

for (const p of PLAN) {
  if (roles[p.name]) { console.log(`  已存在，跳过: ${p.name}`); continue; }
  for (const k of p.kw) {
    if (k.replace(/[^\u4e00-\u9fa5]/g, '').length < 2) console.log(`  !! 关键词过短: ${p.name} -> ${k}`);
  }
  if (new Set(p.kw).size !== p.kw.length) console.log(`  !! 关键词重复: ${p.name}`);
}

// 重建 manifest：按 PLAN 的 after 位置就地插入
const out = {};
for (const [k, v] of Object.entries(roles)) {
  out[k] = v;
  const hit = PLAN.find(p => p.after === k);
  if (hit) {
    out[hit.name] = {
      path: `世界书/角色/${hit.name.replace('_性格调色盘', '')}/性格调色盘.yaml`,
      scope: 'specific',
      part: 'personality',
      keywords: hit.kw,
      abstract: hit.abs,
    };
  }
}

const added = Object.keys(out).length - Object.keys(roles).length;
if (added !== PLAN.length) { console.error(`插入数不符: 期望 ${PLAN.length}，实际 ${added}`); process.exit(1); }

st.entryManifest['角色'] = out;
fs.writeFileSync(STATE, JSON.stringify(st, null, 2), 'utf8');
console.log(`\n已插入 ${added} 条，角色 manifest 现 ${Object.keys(out).length} 条`);
console.log('顺序：');
Object.keys(out).forEach((k, i) => {
  if (k.includes('性格调色盘')) console.log(`  ${String(i).padStart(3)} ${k}`);
});
