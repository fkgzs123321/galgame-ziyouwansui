import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';

// 本轮 11 个新专条所对应的人（潘帅 ≡ 古德，唐藏亲王 ≡ 冬五）
const STRIP = {
  '翡冷翠文职与技术人员.yaml': ['贝克汉姆'],
  '海族与人鱼王族.yaml': ['菲高', '贝肯鲍尔'],
  '人类诸国与教廷.yaml': ['普斯卡什'],
  '唐藏与东方来客.yaml': ['唐藏亲王'],
  '翡冷翠核心家臣.yaml': ['古德', '潘帅', '贝拉米', '维埃里', '科里纳', '罗德曼'],
  '奥尼尔等附庸族代表.yaml': ['奥尼尔'],
};

const LATE = /翡冷翠|神曲|卢塞恩|嘉宝|梦露|贞德|茵格里切宝|小空|介丘|被遗忘国度|遗忘历|太子|左岸天王|恐惧魔王|巫妖王|教宗|圣奇奥|果果|穆里尼奥|花廷|花相|海神岛|花将|花王|最终|战死|阵亡|遗体|海加尔|七星连弩|龙禁卫|摄政|度厄|宫保|紫色霞云|九转|飞亚达|登基|加冕|称帝|皇后|储君/;

for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml')).sort()) {
  const lines = fs.readFileSync(path.join(NPC, f), 'utf8').split('\n');
  let inM = false; let cur = null; const members = [];
  for (const l of lines) {
    if (/^  成员:\s*$/.test(l)) { inM = true; continue; }
    if (inM) {
      const m = l.match(/^    ([^#\s][^:]*):\s*$/);
      if (m) { cur = { k: m[1], lines: [] }; members.push(cur); }
      else if (cur) cur.lines.push(l);
    }
  }
  if (members.length <= 1) continue;
  const strip = STRIP[f] ?? [];
  const cur2 = members.filter(m => LATE.test(m.lines.join('\n')));
  if (!cur2.length) continue;
  console.log(`\n══ ${f} ══`);
  for (const m of cur2) {
    const tag = strip.includes(m.k) ? ' [本轮剥离]' : '';
    const st = m.lines.filter(l => /^\s{6}现状:/.test(l));
    console.log(`  ${m.k}${tag}`);
    st.forEach(l => console.log(`      ${l.trim()}`));
  }
}
