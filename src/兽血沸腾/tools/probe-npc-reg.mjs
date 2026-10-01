import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const m = st.entryManifest;
const NAMES = ['贝克汉姆', '菲高', '贝肯鲍尔', '普斯卡什大师', '普斯卡什', '冬五', '唐藏亲王',
  '古德', '潘帅', '维埃里', '贝拉米', '科里纳', '奥尼尔', '罗德曼'];
console.log('══ entryManifest 各类型条目数 ══');
for (const [t, v] of Object.entries(m)) console.log(`  ${t}: ${Object.keys(v).length}`);
console.log('\n══ 目标名字注册情况 ══');
for (const n of NAMES) {
  const hits = [];
  for (const [t, v] of Object.entries(m)) {
    for (const k of Object.keys(v)) if (k === n || k.includes(n)) hits.push(`${t}/${k}`);
  }
  console.log(`  ${n.padEnd(8)} ${hits.length ? hits.join('  ') : '（未注册）'}`);
}
console.log('\n══ 含「普斯卡什」「贝克汉姆」「菲高」「贝肯鲍尔」「冬五」「唐藏」的任意路径 ══');
for (const [t, v] of Object.entries(m)) {
  for (const [k, e] of Object.entries(v)) {
    if (/普斯卡什|贝克汉姆|菲高|贝肯鲍尔|冬五|唐藏|古德|潘帅|维埃里|贝拉米|科里纳|奥尼尔|罗德曼/.test(k + JSON.stringify(e))) {
      console.log(`  [${t}] ${k}  path=${e.path ?? '(contents)'}  part=${e.part}  strategy=${JSON.stringify(e.strategy)}`);
    }
  }
}
