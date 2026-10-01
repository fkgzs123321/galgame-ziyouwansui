// 把「全面终局态扫描」的结果按是否已被批次覆盖分组，算出还剩谁没派活。
import fs from 'node:fs';

const 扫描 = fs.readFileSync('src/兽血沸腾/tools/_全面终局态扫描.txt', 'utf8');
const 命中行 = 扫描.split('\n').filter(l => l.startsWith('══'));
const 全部 = 命中行.map(l => ({ 名: (l.match(/^══ (.+?)（(\d+) 处）/) || [])[1], 处: Number((l.match(/（(\d+) 处）/) || [])[1]) })).filter(x => x.名);

const 批次一 = ['阿仙奴','革瑞恩','塞壬','谭雅','许德拉','贞德','崔蓓茜','托蒂伯爵','歌坦妮','加茜娅','茉儿','小空'];
const 批次二 = ['玉皇','耐温尔因克','茜茜','姬丝凯碧','艾莉婕','唐蓓尔金娜','隆美尔','伊布','唐家三少','唐家二少','嘉宝','朝河兰','海华丝','克鲁伊夫','安瑞达','德塞利','文泰克莱尔'];
const 已派 = new Set([...批次一, ...批次二, '海伦.列娜', '刘震撼']);

const 未派 = 全部.filter(x => !已派.has(x.名));
const 已派命中 = 全部.filter(x => 已派.has(x.名));

const out = [
  `扫描命中 ${全部.length} 个文件 / ${全部.reduce((s, x) => s + x.处, 0)} 处`,
  `已派 ${已派命中.length} 个 / ${已派命中.reduce((s, x) => s + x.处, 0)} 处`,
  `未派 ${未派.length} 个 / ${未派.reduce((s, x) => s + x.处, 0)} 处`,
  '',
  '── 未派清单 ──',
  ...未派.map(x => `  ${x.名}  ${x.处} 处`),
];
fs.writeFileSync('src/兽血沸腾/tools/_未派角色.txt', out.join('\n'), 'utf8');
console.log(out.slice(0, 3).join('\n'));
console.log('\n未派：' + 未派.map(x => `${x.名}(${x.处})`).join('、'));
