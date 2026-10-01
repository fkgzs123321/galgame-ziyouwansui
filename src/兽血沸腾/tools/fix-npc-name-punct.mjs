// 清理上一轮「姓名」字段残留的标点：尾随「，」、重复「，，」
import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
let n = 0;
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml'))) {
  const p = path.join(NPC, f);
  const t = fs.readFileSync(p, 'utf8');
  const m = t.match(/^  姓名: (.*)$/m);
  if (!m) continue;
  let v = m[1].trim();
  const orig = v;
  v = v.replace(/，，/g, '，').replace(/，+$/, '').replace(/，又称$/, '').replace(/^，+/, '');
  // 「贝斯特」与阿仙奴之父（布尔族牛头人武士贝斯特）撞名 → 该别名无区分度，去掉
  if (f === '乔治.贝斯特.yaml') v = '乔治.贝斯特';
  if (v === orig) continue;
  fs.writeFileSync(p, t.replace(/^  姓名: .*$/m, `  姓名: ${v}`), 'utf8');
  console.log(`  ${f.replace('.yaml', '')}: 「${orig}」→「${v}」`);
  n++;
}
console.log(`\n清理 ${n} 处`);
