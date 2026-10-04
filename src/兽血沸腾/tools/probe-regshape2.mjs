// 只读：NPC / 角色 条目的注册形状（path vs contents），决定硬门加在哪。
import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

for (const 类型 of ['NPC', '角色']) {
  const M = st.entryManifest[类型];
  let 用path = 0, 用contents = 0; const 例 = {};
  for (const [k, v] of Object.entries(M)) {
    if (v.contents) { 用contents++; 例.contents = 例.contents || k; }
    else if (v.path) { 用path++; 例.path = 例.path || k; }
  }
  console.log(`── ${类型}: path=${用path}  contents=${用contents}`);
  for (const [t, k] of Object.entries(例)) {
    console.log(`   ${t} 例「${k}」`);
    console.log('     ' + JSON.stringify({ ...M[k], contents: M[k].contents ? '[…]' : undefined }).slice(0, 340));
  }
}

console.log('\n── NPC/罗德曼.yaml 头 3 行 ──');
console.log(fs.readFileSync('src/兽血沸腾/世界书/NPC/罗德曼.yaml', 'utf8').split('\n').slice(0, 3).join('\n'));
console.log('\n── NPC 里已有 @@ 装饰器的数量 ──');
let n = 0;
for (const f of fs.readdirSync('src/兽血沸腾/世界书/NPC')) {
  if (!f.endsWith('.yaml')) continue;
  if (fs.readFileSync('src/兽血沸腾/世界书/NPC/' + f, 'utf8').includes('@@')) n++;
}
console.log('   ' + n);
