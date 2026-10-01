// 判定「缺私密」的 30 人里有没有女性。用原文里的性别指代词做证据。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');

const 名单 = ['伊布', '克鲁伊夫', '兰帕德', '内德维德', '刘震撼', '卡卡', '卡鲁', '唐家三少', '唐家二少',
  '塞壬', '壹条', '安度兰长老', '小空', '小鹦鹉', '德塞利', '托蒂伯爵', '摩尔亲王', '文泰克莱尔',
  '普斯卡什', '李察王子', '果果', '海华丝', '玉皇', '福格森.徐', '穆里尼奥', '耐温尔因克', '艾弗森',
  '邪眼暴君', '隆美尔', '革瑞恩'];

// 只在同句内统计强性别词
const 女 = ['她', '女子', '姑娘', '少女', '女人', '女士', '小姐', '夫人', '公主', '王后', '母亲', '妈妈', '姐姐', '妹妹', '女孩', '美女', '女骑士', '女官', '女神'];
const 男 = ['他', '男子', '男人', '先生', '老爷', '大人', '父亲', '爸爸', '哥哥', '弟弟', '男孩', '男爵', '骑士大人', '汉子', '雄性'];

console.log('名'.padEnd(14) + '女指代'.padStart(8) + '男指代'.padStart(8) + '  判定');
console.log('─'.repeat(52));
const 疑女 = [];
for (const n of 名单) {
  let c女 = 0, c男 = 0;
  for (const l of 行) {
    if (!l.includes(n)) continue;
    for (const w of 女) c女 += l.split(w).length - 1;
    for (const w of 男) c男 += l.split(w).length - 1;
  }
  const 判 = c女 > c男 * 0.5 && c女 > 20 ? '★ 可能为女' : '男/非人';
  if (判.startsWith('★')) 疑女.push(n);
  console.log(n.padEnd(14) + String(c女).padStart(8) + String(c男).padStart(8) + '  ' + 判);
}
console.log('\n需人工复核的：' + (疑女.join(' · ') || '无'));
