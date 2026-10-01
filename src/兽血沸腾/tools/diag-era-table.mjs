// 只读：纪元表抽查 —— 分布、极端值、以及「在开局前未登场」的关键名单。
import fs from 'fs';

const era = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-table.json', 'utf8'));
const 表 = era.表;
console.log(`纪元 ${era.纪元.length} 段，对象 ${表.length}`);

console.log('\n══ 登场章 < 0 或 > 763 的 ══');
表.filter(x => x.登场 < 0 || x.登场 > 763).forEach(x => console.log(`   ${x.类型}/${x.名} 登场=${x.登场}`));

console.log('\n══ 登场章最晚的 25 个 ══');
[...表].sort((a, b) => b.登场 - a.登场).slice(0, 25).forEach(x => console.log(`   ${String(x.登场).padStart(4)}  ${x.类型}/${x.名}「${x.命中名}」→ ${x.纪元}`));

console.log('\n══ 登场章最早的 20 个 ══');
[...表].sort((a, b) => a.登场 - b.登场).slice(0, 20).forEach(x => console.log(`   ${String(x.登场).padStart(4)}  ${x.类型}/${x.名}「${x.命中名}」→ ${x.纪元}`));

console.log('\n══ 关键 25 位 NSFW 名册的登场章 ══');
const 名册 = ['凝玉','艾薇尔','崔蓓茜','歌坦妮','若尔娜','黛丝','贞德','白素青','谭雅','阿仙奴','许德拉','歌莉妮','唐蓓尔金娜','梦露','嘉宝','艾莉婕','幽月儿','加茜娅','伦娜','费雯丽','朝河兰','珍妮佛','波姬小丝','赫莲娜','安瑞达'];
for (const n of 名册) {
  const r = 表.find(x => x.名 === n);
  console.log(`   ${n.padEnd(12)} ${r ? String(r.登场).padStart(4) + '  ' + r.纪元 + '  「' + r.命中名 + '」' : '❌ 不在表内'}`);
}

console.log('\n══ 5 个开局锚点各自「已登场」人数 ══');
for (const [f, 章] of [['2.yaml', 0], ['4.yaml', 31], ['5.yaml', 27], ['3.yaml', 245], ['6.yaml', 747]]) {
  const n = 表.filter(x => x.登场 >= 0 && x.登场 <= 章).length;
  console.log(`   ${f} 章=${String(章).padStart(3)}  已登场 ${String(n).padStart(3)} / ${表.length}`);
}
