// 安全检查：待改的人名是否被用作 MVU 键 / schema / 界面 / 状态机里的标识符。
import fs from 'fs';
import path from 'path';
const NAMES = ['阿里·代伊','赛义德·卡斯','胡迈德·法克赫尔','拉蔻尔·薇芝','丽塔·海华丝','李察·基尔',
  '西米里安·波塞顿','萨罗蒙·卡鲁','莲·梦露','青雅·白玉','玛莉亚·高树','福格森·徐','乔治·贝斯特',
  '海伦·列娜','罗伯特·巴乔','格雷克·萨尔','大卫·贝克汉姆','克拉克·盖博','保罗·马尔蒂尼','米娅·哈姆'];

const TARGETS = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === 'wip' || e.name === '.patch-history') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else TARGETS.push(p);
  }
})('src/兽血沸腾');
for (const extra of ['src/兽血沸腾.json', 'cards/兽血沸腾/兽血沸腾.json'])
  if (fs.existsSync(extra)) TARGETS.push(extra);

// 只看「结构性」文件：schema/initvar/变量更新规则/界面/state/正则
const STRUCT = TARGETS.filter(p =>
  /schema\.(ts|json)$|initvar|变量更新规则|变量列表|变量输出格式|界面[\\/]|tavern-cards-state\.json|正则|\.json$/.test(p));

console.log(`检查 ${STRUCT.length} 个结构性文件\n`);
let danger = 0;
for (const n of NAMES) {
  const mid = n.replace(/\./g, '·');
  const hits = [];
  for (const f of STRUCT) {
    let t; try { t = fs.readFileSync(f, 'utf8'); } catch { continue; }
    if (t.includes(mid)) hits.push(f.replace(/\\/g, '/'));
  }
  if (hits.length) {
    danger++;
    console.log(`⚠ ${mid} 出现在结构性文件里：`);
    hits.forEach(h => console.log(`     ${h}`));
  }
}
console.log(danger === 0 ? '\n✓ 无一人名被用作结构性标识符，改文本安全' : `\n⚠ ${danger} 个人名出现在结构性文件里 —— 改动需逐个确认`);

// 额外：关系 键 的完整清单
console.log('\n── MVU 关系 键（schema.json 的 关系 properties） ──');
const sj = JSON.parse(fs.readFileSync('src/兽血沸腾/schema.json', 'utf8'));
const rel = sj?.properties?.关系?.properties ?? sj?.$defs?.关系?.properties;
if (rel) console.log('   ' + Object.keys(rel).join('、'));
else {
  // 逐层找
  const found = JSON.stringify(sj).match(/"关系":\{[^}]*"properties":\{([^}]*)\}/);
  console.log('   ' + (found ? found[1].slice(0, 400) : '(未定位)'));
}
