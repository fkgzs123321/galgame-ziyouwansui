import fs from 'fs';
import path from 'path';
const R = 'src/兽血沸腾/世界书/时间线';
const FILES = ['主角前史', '云秦方士纪', '人类诸国兴替纪', '冥界·三统领纪', '创世与神话纪',
  '唐藏花衔纪', '圣保罗教廷扩张纪', '大陆历史', '战后千年对峙纪', '比蒙王国纪元',
  '海加尔战役纪', '海族与西雅海国纪', '矮人与地底纪元', '神系与信仰纪', '神魔大战纪',
  '精灵与德鲁伊纪', '采玉城与卓尔纪', '魔界·嘉宝夺位纪', '龙骑士时代与衰落纪'];

for (const name of FILES) {
  const p = path.join(R, name + '.yaml');
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  console.log(`\n${'═'.repeat(3)} ${name} (${lines.length - 1} 行) ${'═'.repeat(3)}`);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const m = l.match(/^(\s{2})([^\s#][^:]*):\s*$/);
    if (m) console.log(`  [L${i + 1}] ${m[2]}`);
    if (/^\s{4}时间:/.test(l)) console.log(`         ${l.trim()}`);
  }
}
