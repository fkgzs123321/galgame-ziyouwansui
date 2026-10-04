// 区分「描述性部位标签」(允许) 与「宣称了一条原文不存在的设定机制」(缺陷)。
// 龙契烙印 属后者：它声称「与吉格斯缔契时留下的」印记，原文无此机制。
import fs from 'fs';

const 查 = [
  ['安瑞达', '私密.yaml', ['烟角', '鸩腺']],
  ['幽月儿', '私密.yaml', ['蛛后圣痕']],
  ['赫莲娜', '私密.yaml', ['暗肤', '蛛纹']],
  ['谭雅', '私密.yaml', ['珊瑚胶体', '定型痕']],
  ['珍妮佛', '私密.yaml', ['行伍痕', '斗气色']],
  ['波姬小丝', '私密.yaml', ['城主纹章']],
];

for (const [名, f, 词s] of 查) {
  const 行 = fs.readFileSync(`src/兽血沸腾/世界书/角色/${名}/${f}`, 'utf8').split('\n');
  console.log(`\n═══ ${名} ═══`);
  for (const w of 词s) {
    行.forEach((l, i) => { if (l.includes(w + ':')) console.log(`   L${i + 1}「${w}」→ ${l.trim().slice(0, 175)}`); });
  }
}

// 原文里 蛛后 / 安瑞达的种族 是否有据，供判定提供上下文
const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
console.log('\n\n═══ 原文上下文：蛛后 ═══');
原.split('\n').slice(0, 0);
原.split('\n').forEach((l, i) => { if (l.includes('蛛后') && i < 100000) console.log(`   L${i}: ${l.trim().slice(0, 130)}`); });
