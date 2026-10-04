// 探针：老角色的语料有没有保留原文错字？（决定新条目该往哪边靠）
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 检查 = ['若尔娜', '崔蓓茜', '凝玉', '歌坦妮', '黛丝', '艾薇尔', '贞德', '白素青', '谭雅', '阿仙奴', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕'];

let 总 = 0, 坏总 = 0;
for (const n of 检查) {
  const p = `src/兽血沸腾/世界书/角色/${n}/基础信息.yaml`;
  if (!fs.existsSync(p)) { console.log(`  ${n.padEnd(8)} （无基础信息）`); continue; }
  const t = fs.readFileSync(p, 'utf8');
  const qs = [...t.matchAll(/[「“]([^」”]{10,})[」”]/g)].map(m => m[1]);
  const 坏 = qs.filter(q => !原.includes(q));
  总 += qs.length; 坏总 += 坏.length;
  console.log(`  ${n.padEnd(8)} 引文 ${String(qs.length).padStart(2)} 条，逐字不符 ${坏.length} 条`);
  坏.slice(0, 3).forEach(q => {
    const 头 = q.slice(0, 8);
    const c = 原.split('\n').find(l => l.includes(头));
    console.log(`      ✗ 卡: ${q.slice(0, 52)}`);
    if (c) console.log(`        原: ${c.trim().slice(0, 52)}`);
  });
}
console.log(`\n══ 已升格/原有角色：${总} 条引文，逐字不符 ${坏总} 条 ══`);
