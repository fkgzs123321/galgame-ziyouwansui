import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
const PRE = ['贝克汉姆', '菲高', '贝肯鲍尔', '普斯卡什大师', '冬五', '古德', '维埃里', '贝拉米', '科里纳', '奥尼尔', '罗德曼'];
const files = fs.readdirSync(NPC).filter(f => f.endsWith('.yaml'));
const created = files.map(f => f.replace(/\.yaml$/, '')).filter(n => !PRE.includes(n));

function info(n) {
  const t = fs.readFileSync(path.join(NPC, n + '.yaml'), 'utf8');
  const L = t.split('\n');
  const g = (k) => { const m = t.match(new RegExp(`^\\s*${k}:\\s*(.*)$`, 'm')); return m ? m[1].trim() : ''; };
  return { n, 姓名: g('姓名'), 身份: g('身份'), 关系: g('关系'), lines: L.length };
}

// 1) 11 个既有专条 vs 105 个新建：身份串重叠即疑同一人
const pre = PRE.filter(n => files.includes(n + '.yaml')).map(info);
const cre = created.map(info);
console.log('══ 既有专条 11 个的身份串 ══');
pre.forEach(p => console.log(`  ${p.n.padEnd(12)} ${p.身份.slice(0, 90)}`));

console.log('\n══ 身份串与既有专条高度重叠的新建条目 ══');
let hit = 0;
for (const c of cre) {
  for (const p of pre) {
    // 名字级：既有专条名出现在新建条目的姓名/身份/关系中
    if (c.姓名.includes(p.n) || c.身份.includes(p.n) || c.关系.includes(p.n)) {
      console.log(`  ⚠ ${c.n}  含「${p.n}」`);
      console.log(`      姓名: ${c.姓名.slice(0, 80)}`);
      console.log(`      身份: ${c.身份.slice(0, 120)}`);
      hit++;
    }
  }
  // 反向：新建条目名出现在既有专条中
  for (const p of pre) {
    if (p.姓名.includes(c.n) || p.身份.includes(c.n)) {
      console.log(`  ⚠ ${p.n}  含「${c.n}」 → 同一人`);
      hit++;
    }
  }
}
console.log(hit === 0 ? '  无' : `  共 ${hit} 处`);

// 2) 新建条目之间是否有同一人（姓名含别名互指）
console.log('\n══ 新建条目彼此疑似同一人 ══');
let cross = 0;
for (const a of cre) for (const b of cre) {
  if (a.n >= b.n) continue;
  if (a.姓名.includes(b.n) && b.n.length >= 2) { console.log(`  ⚠ ${a.n} 的姓名含「${b.n}」`); cross++; }
}
console.log(cross === 0 ? '  无' : `  共 ${cross} 处`);
