// 同类缺陷扫描：新写条目里的「身体印记/伤处/器官异名」是否为原文真有的说法。
//
// 起因：加茜娅/私密阶段.yaml 有两处臆造——「右侧肋下」(原文只写胳膊上)
// 与「龙契烙印」(`龙契` 全程 0 命中)。这类「编造一个身体标记／伤处」的
// 写法最隐蔽，因为它读起来很具体。本脚本把候选词逐个拿去原文核验。
import fs from 'fs';
import path from 'path';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 数 = s => 原.split(s).length - 1;

// 候选：可能被臆造的身体标记 / 部位异名 / 伤处
const 疑 = [
  '龙契', '灵契', '血契', '心契', '魂印', '龙印', '神印', '魔印', '淫纹', '媚纹',
  '守宫砂', '胎记', '朱砂痣', '淫纹', '乳环', '阴环', '脐环', '舌钉',
  '吻痕', '齿痕', '咬痕', '抓痕', '鞭痕', '烙印', '印记', '纹章', '徽记',
  '肋下', '腰窝', '尾椎', '尾骨', '蝴蝶骨', '锁骨窝', '美人沟', '腰眼',
  '花心', '花径', '蜜壶', '玉门', '幽谷', '桃源', '蚌肉', '蘑菇头',
  '子宫口', '宫颈', '前列腺', '会阴', '耻丘', '阴阜', '股沟',
];

// 只扫新写的 25 个 私密 / 私密阶段 + 12 个调色盘（这些是作者自撰的部分）
const ROOT = 'src/兽血沸腾/世界书/角色';
const NEW = ['幽月儿', '加茜娅', '伦娜', '费雯丽', '朝河兰', '珍妮佛', '波姬小丝', '赫莲娜', '安瑞达'];

const files = [];
for (const d of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, d);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of ['私密.yaml', '私密阶段.yaml', '性格调色盘.yaml']) {
    const p = path.join(dir, f);
    if (fs.existsSync(p)) files.push([d, f, p]);
  }
}
console.log(`扫描 ${files.length} 个文件\n`);

const 报 = [];
for (const [名, f, p] of files) {
  const t = fs.readFileSync(p, 'utf8');
  for (const w of 疑) {
    if (!t.includes(w)) continue;
    const n = 数(w);
    报.push([名, f, w, n]);
  }
}

// 按命中数排序：0 命中的优先，那是确凿的臆造
报.sort((a, b) => a[3] - b[3]);
console.log('══ 命中为 0 的（确凿臆造，必修）══');
const 零 = 报.filter(r => r[3] === 0);
if (!零.length) console.log('   无');
for (const [名, f, w] of 零) console.log(`   ✗ ${名}/${f}  →「${w}」`);

console.log('\n══ 命中 ≤ 2 的（稀少，需人眼复核是否被当了专名）══');
for (const [名, f, w, n] of 报.filter(r => r[3] > 0 && r[3] <= 2)) {
  console.log(`   ? ${名}/${f}  →「${w}」×${n}`);
}
