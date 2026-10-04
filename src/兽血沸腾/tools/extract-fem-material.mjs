// 为新增女性角色抽取素材包。
//   {名}.txt      —— 全部命中行（带行号）
//   {名}.情欲.txt  —— 与身体/情欲词同句共现的行
// 素材只作证据，不作成文。
import fs from 'fs';
import path from 'path';

const TXT = 'src/兽血沸腾/兽血沸腾.txt';
const OUT = 'src/兽血沸腾/tools/fem-material';
const LINES = fs.readFileSync(TXT, 'utf8').split('\n');
fs.mkdirSync(OUT, { recursive: true });

const SEX = /奶子|乳房|乳晕|奶头|乳头|胸脯|酥胸|阴唇|阴蒂|阴道|肉缝|蜜穴|花径|逼|屄|鸡巴|臀|屁股|屁眼|大腿|脚踝|纤腰|腋|肏|插进|抽送|射精|淫水|爱液|蜜汁|高潮|情欲|敏感|名器|初夜|落红|破处|怀孕|受孕|体香|体味|分泌/;
const PAST = /曾经|当年|昔日|旧时|从前|那一夜|当初/;

const LIST = [
  // A 组：17 位女性 NPC
  '伦娜', '依莎贝拉', '冰肌仙子', '凌波仙子', '加茜娅', '勃郎宁', '含香仙子', '巢农主母',
  '希丁克', '幽月儿', '朝河兰', '波姬小丝', '珍妮佛', '米娅', '罗浮仙子', '费雯丽', '赫莲娜',
  // B 组：缺调色盘的女性角色
  '喀秋莎', '塞壬',
  // C 组：未成年女性角色（只补性格调色盘）
  '茜茜', '姬丝凯碧', '安瑞达',
];

for (const n of LIST) {
  const 全 = [];
  const 情欲 = [];
  const 过往 = [];
  // 名字可能带 ·后缀（米娅·哈姆 / 幽月儿·杜垩登）
  const head = n.slice(0, 2);
  for (let i = 0; i < LINES.length; i++) {
    const l = LINES[i];
    const hit = l.includes(n) || (l.includes(head) && new RegExp(head + '[·.．]').test(l));
    if (!hit) continue;
    const rec = `L${i + 1}: ${l.trim()}`;
    全.push(rec);
    if (SEX.test(l)) 情欲.push(rec);
    if (PAST.test(l)) 过往.push(rec);
  }
  fs.writeFileSync(path.join(OUT, `${n}.txt`), `### ${n} 全部命中 ${全.length} 行\n` + 全.join('\n') + '\n', 'utf8');
  fs.writeFileSync(path.join(OUT, `${n}.情欲.txt`), `### ${n} 情欲共现 ${情欲.length} 行\n` + 情欲.join('\n') + '\n', 'utf8');
  fs.writeFileSync(path.join(OUT, `${n}.过往.txt`), `### ${n} 过往/前史 ${过往.length} 行\n` + 过往.join('\n') + '\n', 'utf8');
  console.log(`${n.padEnd(10)} 全 ${String(全.length).padStart(4)}  情欲 ${String(情欲.length).padStart(3)}  过往 ${String(过往.length).padStart(3)}`);
}
console.log(`\n→ ${OUT}`);
