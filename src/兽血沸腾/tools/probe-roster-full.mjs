import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书/角色';
const dirs = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name).sort();

console.log('目录'.padEnd(18) + '性别'.padEnd(6) + '年龄'.padEnd(16) + '种族 / 身份');
console.log('─'.repeat(120));
const info = {};
for (const d of dirs) {
  const p = path.join(ROOT, d, '基础信息.yaml');
  if (!fs.existsSync(p)) { console.log(`${d.padEnd(18)}(无基础信息)`); continue; }
  const L = fs.readFileSync(p, 'utf8').split('\n');
  const grab = k => {
    const m = L.find(l => new RegExp(`^\\s{2}${k}:`).test(l));
    return m ? m.replace(/^\s{2}[^:]+:\s*/, '').trim() : '';
  };
  const sex = grab('性别'), age = grab('年龄'), race = grab('种族'), id = grab('身份');
  info[d] = { sex, age, race, id };
  const tail = `${race}${id ? ' / ' + id : ''}`;
  console.log(`${d.padEnd(18)}${(sex || '?').padEnd(6)}${(age || '-').slice(0, 14).padEnd(16)}${tail.slice(0, 78)}`);
}

console.log('\n\n══ 原文年龄佐证（女性候选）══');
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = t.split('\n');
const NAMES = dirs.filter(d => !/果果|壹条|安度兰|穆里尼奥|隆美尔|李察王子|普斯卡什|海伦/.test(d) || /海伦/.test(d));
for (const n of ['艾薇尔', '贞德', '白素青', '梦露', '艾莉婕', '喀秋莎', '唐蓓尔金娜', '歌莉妮', '塞壬', '海华丝', '谭雅', '嘉宝', '小空', '阿仙奴', '安瑞达', '革瑞恩']) {
  const hits = [];
  lines.forEach((l, i) => {
    if (l.includes(n) && /(今年|才|只有|已经|年方|岁)/.test(l) && /(岁|成年|年纪)/.test(l)) hits.push([i + 1, l.trim()]);
  });
  const shown = hits.slice(0, 2);
  console.log(`\n${n} — ${hits.length} 行`);
  for (const [ln, s] of shown) console.log(`   L${ln}: ${s.slice(0, 150)}`);
}
