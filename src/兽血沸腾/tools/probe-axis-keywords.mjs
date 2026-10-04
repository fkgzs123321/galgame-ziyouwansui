import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const iv = fs.readFileSync('src/兽血沸腾/世界书/变量/initvar.yaml', 'utf8');

console.log('══ 章节序号 / 剧情 结构 ══');
const li = iv.split('\n');
const gi = li.findIndex(l => /^剧情:/.test(l));
console.log(li.slice(gi, gi + 14).join('\n'));

console.log('\n══ 关系 全部键 ══');
const ri = li.findIndex(l => /^关系:/.test(l));
const keys = [];
for (let i = ri + 1; i < li.length; i++) {
  if (/^\S/.test(li[i])) break;
  const m = li[i].match(/^ {2}([^\s:]+):/);
  if (m) keys.push(m[1]);
}
console.log(keys.join('、'), `（${keys.length}）`);

const ROSTER = ['凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝', '贞德', '白素青',
  '谭雅', '珊瑚美人', '阿仙奴', '安瑞达', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕'];

console.log('\n══ 每个角色的分档轴 ══');
for (const n of ROSTER) {
  const axis = keys.includes(n) ? `关系.${n}.好感度` : '剧情.章节序号';
  console.log(`  ${n.padEnd(12)} → ${axis}`);
}

console.log('\n══ 关键词候选（原文计数）══');
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const CANDS = {
  '凝玉': ['凝玉', '蚌女', '蚌人', '凝玉小姐', '凝玉夫人'],
  '艾薇尔': ['艾薇尔', '艾薇儿', '人鱼公主', '艾薇尔公主', '美人鱼公主'],
  '崔蓓茜': ['崔蓓茜', '崔蓓西', '妮可', '美女蛇', '妮可女伯爵'],
  '歌坦妮': ['歌坦妮', '天鹅女骑士', '歌坦妮小姐'],
  '若尔娜': ['若尔娜', '老板娘', '若尔娜大师'],
  '黛丝': ['黛丝', '黛丝小姐'],
  '贞德': ['贞德', '契女'],
  '白素青': ['白素青', '素青', '青玉灵蟒'],
  '谭雅': ['谭雅', '娜娜'],
  '珊瑚美人': ['珊瑚美人'],
  '阿仙奴': ['阿仙奴'],
  '安瑞达': ['安瑞达', '鸩女', '毒焰魔王'],
  '许德拉': ['许德拉', '九头蛇怪', '风暴九头蛇'],
  '歌莉妮': ['歌莉妮'],
  '唐蓓尔金娜': ['唐蓓尔金娜', '冰凰'],
  '梦露': ['梦露'],
  '嘉宝': ['嘉宝'],
  '艾莉婕': ['艾莉婕'],
};
for (const [n, cs] of Object.entries(CANDS)) {
  const parts = cs.map(c => `${c}:${(t.match(new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length}`);
  console.log(`  ${n.padEnd(12)} ${parts.join('  ')}`);
}
