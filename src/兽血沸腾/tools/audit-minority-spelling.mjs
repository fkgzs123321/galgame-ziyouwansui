import fs from 'fs';
import path from 'path';

// 已裁定的统一写法：minority -> canonical。只扫描产品文件，跳过原文/成品/工具/裁定日志。
const PAIRS = [
  ['圣弗朗西斯科', '圣弗郎西斯科'],
  ['艾薇儿', '艾薇尔'],
  ['撤桑大陆', '澈桑大陆'],
  ['那迦', '娜迦'],
  ['冥帝', '幽帝'],
  ['艾佛森', '艾弗森'],
  ['博克村', '博格村'],
  ['云梦山', '云雾山'],
  ['若文诺克', '墨若文克'],
  ['元老院', '长老院'],
  ['晕眩之歌', '眩晕之歌'],
  ['生命锁链战歌', '心灵锁链战歌'],
  ['琴心战歌', '琴心'],
  ['斯迈禁空之歌', '禁空之歌'],
  ['地底军工基地', '地底兵工厂'],
  ['福克森', '福格森.徐'],
  ['泰格族', '泰戈族'],
  ['剑齿荒原', '落日大沼泽'],
  ['君士坦丁堡', '龙城'],
];

// 允许保留少数写法的行（裁定注释）
const SKIP = /写作|也作|异写|两种写法|少数写法|统一用|裁定|又称|别名|不是同一|≠/;

const ROOTS = ['src/兽血沸腾/世界书', 'src/兽血沸腾/开场白', 'src/兽血沸腾/界面', 'src/兽血沸腾/角色卡'];
const EXTS = new Set(['.yaml', '.yml', '.md', '.txt', '.vue', '.ts', '.html', '.json']);
const SKIP_FILES = [/术语纪律/, /写作派发规范/, /转化执行规范/, /转化合并记录/, /创作规划\.yaml/, /章节名录/, /缺口素材/, /派发素材/, /控制中心/, /兽血沸腾\.json/, /schema\.json/, /兽血沸腾\.txt/];

function walk(d) {
  const out = [];
  if (!fs.existsSync(d)) return out;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (EXTS.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

let total = 0;
for (const root of ROOTS) {
  for (const f of walk(root)) {
    const rel = path.relative('src/兽血沸腾', f).replace(/\\/g, '/');
    if (SKIP_FILES.some(r => r.test(f))) continue;
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    lines.forEach((l, i) => {
      if (SKIP.test(l)) return;
      for (const [bad, good] of PAIRS) {
        if (l.includes(bad)) {
          console.log(`  ${rel}:${i + 1}  「${bad}」→「${good}」`);
          console.log(`     ${l.trim().slice(0, 130)}`);
          total++;
        }
      }
    });
  }
}
console.log(total === 0 ? '\n少数写法 0 处（不含裁定注释）' : `\n共 ${total} 处待确认`);
