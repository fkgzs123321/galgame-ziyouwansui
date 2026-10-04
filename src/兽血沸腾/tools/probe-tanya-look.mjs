// 谭雅(=珊瑚美人) 的外观原文取证：找出所有直接描写她外貌的句子。
import fs from 'fs';

const L = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const NAME = /(珊瑚美人|谭雅)/;
// 外观相关词
const LOOK = /(长发|头发|发色|黑发|栗色|青铜色|蓝眼睛|眼白|眼波|肌肤|皮肤|牙色|象牙|身段|腰肢|小腹|乳|胸|臀|腿|脚尖|赤裸|一丝不挂|美艳|绝色)/;

console.log('════ 一、直接描写她外形的句子（名字 + 外观词同句）════');
let n = 0;
L.forEach((l, i) => {
  if (NAME.test(l) && LOOK.test(l)) {
    n++;
    console.log('L' + (i + 1) + '| ' + l.trim().slice(0, 190));
  }
});
console.log('共 ' + n + ' 行');

console.log('\n════ 二、她的首次登场描写段（以「珊瑚美人」首次出现为中心 ±6 行）════');
let first = -1;
for (let i = 0; i < L.length; i++)
  if (L[i].includes('珊瑚美人')) {
    first = i;
    break;
  }
console.log('首次出现: L' + (first + 1));
for (let i = Math.max(0, first - 6); i < Math.min(L.length, first + 8); i++)
  console.log('L' + (i + 1) + '| ' + L[i].trim().slice(0, 200));

console.log('\n════ 三、发色专查 ════');
const HAIR = /(黑发|黑色|栗色|青铜色|乌黑)/;
L.forEach((l, i) => {
  if (NAME.test(l) && HAIR.test(l)) console.log('L' + (i + 1) + '| ' + l.trim().slice(0, 190));
});

console.log('\n════ 四、定型/变形之后的外形变化 ════');
L.forEach((l, i) => {
  if (NAME.test(l) && /(定型|塑形指|变形咒|贝普赛)/.test(l) && /(发|貌|形|脸|身)/.test(l))
    console.log('L' + (i + 1) + '| ' + l.trim().slice(0, 190));
});
