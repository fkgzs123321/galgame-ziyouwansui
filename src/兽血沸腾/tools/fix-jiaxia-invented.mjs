// 修 加茜娅/私密.yaml 的两处臆造，并全量复查同类。
//
// ① 「龙契烙印」：`龙契` 全程 0 命中，原文从未写过龙骑士与龙之间有肉体印记。
//    原文只有「心灵契约」(L9793) / 「契约」(L15295) 这种抽象说法。
//    这个词还被 extract-nsfw-parts.mjs 当成部位键收进了 界面/私密部位.ts，
//    属「专名必须原文真有」铁律的违反，整键删除。
// ② 「旧伤：右侧肋下」：原文只写胳膊上——L81165 贞德问「加茜娅。你的胳膊上
//    为什么有伤？」、L81241「甚至连龙骑士加茜娅都受了伤！」。全篇 `肋下` 8 次
//    命中无一次与她有关。改成胳膊上。
//
// 判据补充（本次确立）：命中 0 的解剖词要分两类——
//   「臆造专名」（`龙契烙印`，被当作部位键/专有名）＝缺陷，必须删；
//   「普通解剖同义词」（`尾骨`/`腰窝`，用作白话描述）＝正常，不属臆造。
import fs from 'fs';
import path from 'path';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 数 = s => 原.split(s).length - 1;

// ── ① 加茜娅/私密.yaml ──
const F = 'src/兽血沸腾/世界书/角色/加茜娅/私密.yaml';
let t = fs.readFileSync(F, 'utf8');

const 删行 = [
  /^\s*龙契烙印: 后心偏左.*\n/m,          // 外观 里的臆造印记
  /^\s*龙契烙印: 手掌压上去.*\n/m,        // 敏感带 里的臆造印记
];
let n = 0;
for (const re of 删行) {
  if (!re.test(t)) { console.log(`⚠ 未匹配：${re}`); continue; }
  t = t.replace(re, '');
  n++;
}

const 替换 = [
  ['旧伤: 右侧肋下，魔族围攻时留下的一道疤，两指长，长好了也是硬的。天阴就酸。按上去她会嘶一声',
   '旧伤: 胳膊上，教廷从帝梵西撤往翡冷翠那一场留下的一道疤，两指长，长好了也是硬的。天阴就酸。按上去她会嘶一声'],
  ['肋下旧伤: 被舌头顶到那一小块硬皮，她咬牙，咬住不放',
   '胳膊旧伤: 被舌头顶到那一小块硬皮，她咬牙，咬住不放'],
];
for (const [旧, 新] of 替换) {
  const c = t.split(旧).length - 1;
  if (c !== 1) { console.log(`⚠ 「${旧.slice(0, 20)}…」命中 ${c} 次，跳过`); continue; }
  t = t.replace(旧, 新);
  n++;
}
fs.writeFileSync(F, t, 'utf8');
console.log(`加茜娅/私密.yaml 改动 ${n} 处`);

// ── ② 全量复查：全部 私密/私密阶段 里的臆造专名与伤处 ──
const ROOT = 'src/兽血沸腾/世界书/角色';
const 专名 = ['龙契', '灵契', '血契', '心契', '魂印', '龙印', '神印', '魔印', '淫纹', '媚纹', '守宫砂', '淫纹'];
const 伤处 = ['肋下', '右侧肋', '左肋', '断骨', '旧伤'];

console.log('\n══ 全量复查 88 个文件 ══');
let 坏 = 0;
for (const d of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, d);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of ['私密.yaml', '私密阶段.yaml', '性格调色盘.yaml', '基础信息.yaml']) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) continue;
    const s = fs.readFileSync(p, 'utf8');
    for (const w of 专名) {
      if (s.includes(w) && 数(w) === 0) { console.log(`   ✗ 臆造专名 ${d}/${f} →「${w}」`); 坏++; }
    }
    if (f === '私密.yaml' || f === '私密阶段.yaml') {
      for (const w of ['右侧肋下', '左侧肋下', '右肋下', '左肋下']) {
        if (s.includes(w)) { console.log(`   ✗ 臆造伤处 ${d}/${f} →「${w}」`); 坏++; }
      }
    }
  }
}
console.log(`   缺陷 ${坏} 个`);
