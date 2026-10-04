// 全量年龄字段审计：把每个角色条目里的「年龄」与原文里的年龄表述对照。
import fs from 'fs';
import path from 'path';

const 角色 = 'src/兽血沸腾/世界书/角色';
const 行 = [];

for (const d of fs.readdirSync(角色)) {
  const p = path.join(角色, d, '基础信息.yaml');
  if (!fs.existsSync(p)) continue;
  const t = fs.readFileSync(p, 'utf8');
  const m = t.match(/^\s*年龄:\s*(.*)$/m);
  const st = fs.statSync(p);
  行.push([d, m ? m[1].trim() : '', st.mtime.toISOString().slice(0, 19)]);
}

console.log(`══ 角色基础信息「年龄」字段：${行.length} 个 ══\n`);
for (const [n, a, t] of 行.sort((x, y) => (x[2] < y[2] ? 1 : -1))) {
  const 标 = /岁|成年|发育|幼|小/.test(a) ? '' : '  ← 无年龄';
  console.log(`   ${n.padEnd(14)} ${t.slice(11)}  ${a || '(缺)'}${标}`);
}

// 找出含「未成年/幼/小」等疑点的
console.log('\n══ 疑点：年龄字段里出现「小/幼/童/未/岁数小」的 ══');
for (const [n, a] of 行) {
  if (/幼|童|未成|小女|萝莉|还没|尚未/.test(a)) console.log(`   ${n}: ${a}`);
}

// 原文权威数字
const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
console.log('\n══ 原文权威年龄句 ══');
const 句 = [
  ['茜茜', '看上去年纪最多十四五岁，还没有发育完全'],
  ['茜茜', '茜茜还未到成年礼'],
  ['茉儿', '茉儿今年多大？十一岁'],
  ['茉儿', '最后一批明年春天满十岁的小孩，茉儿正在这其中'],
  ['姬丝凯碧', '她今年才六岁，虽然佛巨人身高达到十米，可是我们的姬丝凯碧小姐还没发育呢'],
  ['姬丝凯碧', '姬丝凯碧今年才六岁，才六岁！'],
  ['姬丝凯碧', '换算成比蒙的年龄'],
];
for (const [n, s] of 句) console.log(`   ${n.padEnd(8)} 「${s.slice(0, 44)}…」 → ${原.split(s).length - 1}`);
