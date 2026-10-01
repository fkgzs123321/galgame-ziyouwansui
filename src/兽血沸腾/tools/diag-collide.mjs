// 诊断8：核对几个疑似同名/误命中的角色，看条目自己怎么说。
import fs from 'fs';
import path from 'path';

const DIR = 'src/兽血沸腾/世界书/角色';
for (const n of ['许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '艾莉婕', '贞德', '崔蓓茜', '幽月儿', '海伦.列娜', '凝玉', '嘉宝', '费雯丽']) {
  const p = path.join(DIR, n, '基础信息.yaml');
  if (!fs.existsSync(p)) { console.log(`── ${n}: 无基础信息\n`); continue; }
  const t = fs.readFileSync(p, 'utf8');
  const 头 = t.split('\n').slice(0, 12).join('\n');
  console.log(`── ${n} ──`);
  console.log(头);
  console.log('');
}
