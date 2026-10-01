// 核实：① 断臂的真实缘由  ② 艾薇尔 vs 艾薇儿 的原文用字
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数 = s => 原.split(s).length - 1;

console.log('艾薇尔 ' + 数('艾薇尔') + ' · 艾薇儿 ' + 数('艾薇儿') + ' · 艾薇爾 ' + 数('艾薇爾'));

// 找断臂的现场：与「八门金锁阵」「珊瑚」「断」同现的段落
console.log('\n── 「挥刀断臂」/「断臂」前后关键线索：搜「左手」「砍断」「砍下」「自己砍」 ──');
行.forEach((l, i) => {
  if (i < 28000 || i > 32000) return;
  if (/砍断|砍下|自己地?砍|挥刀|齐肘|左手.*断|断.*左手/.test(l)) console.log(`   L${i}: ${l.trim().slice(0, 165)}`);
});

console.log('\n── 30800-30900 段（若尔娜评断臂）──');
for (let i = 30830; i < 30870; i++) if (行[i]) console.log(`   L${i}: ${行[i].trim().slice(0, 165)}`);
