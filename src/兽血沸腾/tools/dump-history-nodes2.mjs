import fs from 'fs';
import path from 'path';
const R = 'src/兽血沸腾/世界书/时间线';
const FILES = ['主角前史', '云秦方士纪', '人类诸国兴替纪', '冥界·三统领纪', '创世与神话纪',
  '唐藏花衔纪', '圣保罗教廷扩张纪', '大陆历史', '战后千年对峙纪', '比蒙王国纪元',
  '海加尔战役纪', '海族与西雅海国纪', '矮人与地底纪元', '神系与信仰纪', '神魔大战纪',
  '精灵与德鲁伊纪', '采玉城与卓尔纪', '魔界·嘉宝夺位纪', '龙骑士时代与衰落纪'];

// 只在 764 章正文期才出现、且不属于远古历史的标记
const LATE = ['介丘', '被遗忘国度', '遗忘历', '神曲萨满', '太子诞', '茵格里切宝', '小空', '小净',
  '嘉宝', '梦露', '贞德', '穆里尼奥', '果果', '壹条', '李察', '刘震撼', '翡冷翠',
  '时空大裂缝重', '神曲光环', '权杖祭祀与教宗', '遗忘历', '左岸天王', '爱琴圣阶'];

let grand = { ancient: 0, contemporary: 0, unsure: 0 };
for (const name of FILES) {
  const p = path.join(R, name + '.yaml');
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  console.log(`\n${'═'.repeat(4)} ${name} ${'═'.repeat(4)}`);
  for (let i = 0; i < lines.length; i++) {
    // 顶层节点：第 0 列、以冒号结尾、非空
    if (!/^[^\s#][^:]*:\s*$/.test(lines[i])) continue;
    const node = lines[i].replace(/:.*$/, '');
    // 收集该节点正文到下一个顶层键
    let body = '';
    for (let j = i + 1; j < lines.length; j++) {
      if (/^[^\s#][^:]*:\s*$/.test(lines[j])) break;
      if (/^[^\s#]/.test(lines[j]) && lines[j].trim()) break;
      body += lines[j] + '\n';
    }
    const tm = body.match(/^\s*时间:\s*(.+)$/m);
    const t = tm ? tm[1].trim() : '(无时间字段)';
    const hits = LATE.filter(k => body.includes(k));
    console.log(`  [L${i + 1}] ${node}`);
    console.log(`        时间: ${t}`);
    if (hits.length) console.log(`        ⚠ 当代标记: ${hits.slice(0, 6).join('、')}`);
  }
}
