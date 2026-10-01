// 系统性重复角色检测。
// 思路：同一个人若在原文里被两个名字指称，最常见的形式是「同位语连写」，例如「珊瑚美人谭雅」。
// 做法：一遍扫源文，找出所有「两个角色名紧挨着出现」的位置，再统计每一对的出现次数。
// 另外附带检查：每个角色自己的 基础信息.yaml 的「名称/姓名」行里是否提到了别的角色名。
import fs from 'fs';
import path from 'path';

const DIR = 'src/兽血沸腾/世界书/角色';
const TXT = 'src/兽血沸腾/兽血沸腾.txt';

const names = fs
  .readdirSync(DIR, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name);

// 名字按长度降序，保证最长匹配优先
const sorted = [...names].sort((a, b) => b.length - a.length);
const re = new RegExp(sorted.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

const lines = fs.readFileSync(TXT, 'utf8').split('\n');
const adjacent = new Map(); // "A|B" -> {count, sample}
const naming = new Map(); // 命名句

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (!/谭雅|珊瑚|美人|少女|人鱼|天鹅|公主|女王|长老|大人|圣女|老板娘/.test(l) && !/[\u4e00-\u9fff]/.test(l)) continue;
  re.lastIndex = 0;
  const hits = [];
  let m;
  while ((m = re.exec(l)) !== null) {
    hits.push({ name: m[0], start: m.index, end: m.index + m[0].length });
    if (m[0].length === 0) re.lastIndex++;
  }
  if (hits.length < 2) continue;
  for (let a = 0; a < hits.length; a++)
    for (let b = 0; b < hits.length; b++) {
      if (a === b) continue;
      const A = hits[a];
      const B = hits[b];
      // 紧挨着：A 的末尾与 B 的开头之间没有别的名字、且间隔 <= 1 个字符
      if (B.start >= A.end && B.start - A.end <= 1) {
        const key = A.name + '|' + B.name;
        const cur = adjacent.get(key) || { count: 0, sample: [] };
        cur.count++;
        if (cur.sample.length < 2) cur.sample.push('L' + (i + 1) + '| ' + l.trim().slice(0, 130));
        adjacent.set(key, cur);
        // 名字连写附近若还有命名动词，就是「给她起名」这类铁证
        if (/叫|名字|起名|命名|正是|就是|原名|称作|叫做/.test(l)) {
          const nk = A.name + '|' + B.name;
          const cn = naming.get(nk) || { count: 0, sample: [] };
          cn.count++;
          if (cn.sample.length < 3) cn.sample.push('L' + (i + 1) + '| ' + l.trim().slice(0, 150));
          naming.set(nk, cn);
        }
      }
    }
}

console.log('════ 一、紧挨连写次数 >= 5 的名字对（疑似同一人）════');
const rows = [...adjacent.entries()].filter(([, v]) => v.count >= 5).sort((a, b) => b[1].count - a[1].count);
if (!rows.length) console.log('（无）');
for (const [k, v] of rows) {
  const [A, B] = k.split('|');
  const sym = adjacent.get(B + '|' + A);
  console.log(`\n${A} + ${B}  连写 ${v.count} 次${sym ? `（反向 ${sym.count} 次）` : ''}`);
  for (const s of v.sample) console.log('   ' + s);
}

console.log('\n\n════ 二、连写且同句出现命名动词（同一人的直接证据）════');
if (!naming.size) console.log('（无）');
for (const [k, v] of [...naming.entries()].sort((a, b) => b[1].count - a[1].count)) {
  console.log(`\n${k.replace('|', ' ⇄ ')}  ${v.count} 次`);
  for (const s of v.sample) console.log('   ' + s);
}

console.log('\n\n════ 三、各自「名称/姓名」字段里提到别的角色名（身份重叠）════');
let found = false;
for (const n of names) {
  const f = path.join(DIR, n, '基础信息.yaml');
  if (!fs.existsSync(f)) continue;
  const head = fs.readFileSync(f, 'utf8').split('\n').slice(0, 12);
  for (let i = 0; i < head.length; i++) {
    for (const other of names) {
      if (other === n) continue;
      if (head[i].includes(other)) {
        console.log(`  ${n}/基础信息.yaml:${i + 1}  提到「${other}」`);
        console.log(`      ${head[i].trim().slice(0, 130)}`);
        found = true;
      }
    }
  }
}
if (!found) console.log('（无）');
