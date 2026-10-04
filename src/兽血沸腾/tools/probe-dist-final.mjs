// 最终核验：25 人名册是否完整进了状态栏产物。
import fs from 'fs';

const ROSTER = ['凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝', '贞德', '白素青', '谭雅',
  '阿仙奴', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕',
  '幽月儿', '加茜娅', '伦娜', '费雯丽', '朝河兰', '珍妮佛', '波姬小丝', '赫莲娜', '安瑞达'];

const html = fs.readFileSync('dist/兽血沸腾/界面/状态栏/index.html', 'utf8');
const 形 = fs.readFileSync('dist/兽血沸腾/界面/开局表单/index.html', 'utf8');

console.log('══ 25 人名册 → 状态栏产物 ══');
let 缺 = [];
for (const n of ROSTER) if (!html.includes(n)) 缺.push(n);
console.log(`   ${ROSTER.length - 缺.length}/${ROSTER.length} 命中；缺：${缺.join('、') || '无'}`);

// 名器
const 名器 = ['探骊得珠', '青玉绞珠', '九曲衔珠', '卧绵藏潮', '冻骨衔珠', '蛛帐垂丝', '玉鞍收辔',
  '澄渊回焰', '蜕玉沁凉', '寒汐归册', '叠阵锁锋', '鸩烟瞒天', '素绶收虹', '光阴难买一寸金'];
console.log('\n══ 名器 ══');
const 缺器 = 名器.filter(m => !html.includes(m));
console.log(`   ${名器.length - 缺器.length}/${名器.length} 命中；缺：${缺器.join('、') || '无'}`);

// 部位契约 15 项
const 部 = ['奶子', '奶头', '乳晕', '逼', '阴唇', '阴蒂', '屁眼', '腰腹', '臀部', '腿', '足', '手', '口舌', '腋下', '发肤'];
console.log('\n══ 契约部位 15 项 ══');
const 缺部 = 部.filter(b => !html.includes(b));
console.log(`   ${部.length - 缺部.length}/${部.length} 命中；缺：${缺部.join('、') || '无'}`);

// 8 面板
const 面板 = ['总览', '战斗', '技能树', '领地', '图鉴', '编年史', '魔宠', '后宫'];
console.log('\n══ 8 面板 ══');
const 缺面 = 面板.filter(p => !html.includes(p));
console.log(`   ${面板.length - 缺面.length}/${面板.length} 命中；缺：${缺面.join('、') || '无'}`);

// 开局表单 5 开局
console.log('\n══ 开局表单 ══');
console.log(`   产物 ${形.length} B`);
for (const n of ['幽月儿', '加茜娅', '伦娜', '费雯丽', '朝河兰']) {
  if (!形.includes(n)) console.log(`   ⚠ 开局表单未提到 ${n}`);
}
console.log(`\n状态栏产物 ${html.length} B`);
