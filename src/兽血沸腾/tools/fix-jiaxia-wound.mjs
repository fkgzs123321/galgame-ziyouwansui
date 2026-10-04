// 修正 加茜娅/私密阶段.yaml 的臆造伤处。
//
// 原文只写「胳膊上」：
//   L81165 贞德：「大家这是怎么了？加茜娅。你的胳膊上为什么有伤？」
//   L81241 「甚至连龙骑士加茜娅都受了伤！」
// 全篇 `肋下` 8 次命中，无一次与加茜娅有关（分别是地精、巨魔、刘震撼藤甲、
// 邪眼暴君触须、泰戈武士、摩尔剑咏、黑发女子）。故「右侧肋下」属臆造，
// 改成原文确证的「胳膊上」。
import fs from 'fs';

const F = 'src/兽血沸腾/世界书/角色/加茜娅/私密阶段.yaml';
let t = fs.readFileSync(F, 'utf8');

const 改 = [
  ['肋下挨了一记', '胳膊上挨了一记'],
  ['睡下去右侧肋下那道疤发硬', '睡下去胳膊上那道疤发硬'],
  ['天阴的时候她会无意识地按一下肋下', '天阴的时候她会无意识地按一下胳膊'],
  ['肋下那道疤一直没消', '胳膊上那道疤一直没消'],
];

let n = 0;
for (const [旧, 新] of 改) {
  const c = t.split(旧).length - 1;
  if (c !== 1) { console.log(`⚠ 「${旧}」命中 ${c} 次，期望 1，跳过`); continue; }
  t = t.replace(旧, 新);
  n++;
  console.log(`✓ ${旧}  →  ${新}`);
}
fs.writeFileSync(F, t, 'utf8');
console.log(`\n共改 ${n} 处`);

// 卡内其他 私密阶段 是否有同类臆造
console.log('\n══ 全部 私密阶段.yaml 里的「肋下」 ══');
const root = 'src/兽血沸腾/世界书/角色';
let 总 = 0;
for (const d of fs.readdirSync(root)) {
  const p = `${root}/${d}/私密阶段.yaml`;
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  if (s.includes('肋下')) { console.log(`   ⚠ ${d}`); 总++; }
}
console.log(`   ${总} 个文件仍含「肋下」`);
