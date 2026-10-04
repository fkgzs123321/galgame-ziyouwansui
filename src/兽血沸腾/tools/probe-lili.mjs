// 核实「莉莉」到底指歌坦妮还是歌莉妮，避免把姐姐的小名挂到妹妹身上。
import fs from 'fs';

const L = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');

console.log('════ 一、含「莉莉」的行（全部）════');
let n = 0;
L.forEach((l, i) => {
  if (l.includes('莉莉')) {
    n++;
    if (n <= 40) console.log('L' + (i + 1) + '| ' + l.trim().slice(0, 170));
  }
});
console.log('共 ' + n + ' 行\n');

console.log('════ 二、「莉莉」与两个全名同句 ════');
L.forEach((l, i) => {
  if (l.includes('莉莉') && /(歌坦妮|歌莉妮)/.test(l)) {
    console.log('L' + (i + 1) + '| ' + l.trim().slice(0, 190));
  }
});

console.log('\n════ 三、各自出现次数 ════');
for (const k of ['莉莉', '歌坦妮', '歌莉妮']) {
  console.log(k + ': ' + L.filter(l => l.includes(k)).length + ' 行');
}

console.log('\n════ 四、「莉莉」邻近 5 行内出现谁 ════');
L.forEach((l, i) => {
  if (!l.includes('莉莉')) return;
  const win = L.slice(Math.max(0, i - 5), i + 6).join('');
  const who = [];
  if (/歌坦妮/.test(win)) who.push('歌坦妮(近)');
  if (/歌莉妮/.test(win)) who.push('歌莉妮(近)');
  if (who.length) console.log('L' + (i + 1) + ' ' + who.join('+') + '| ' + l.trim().slice(0, 120));
});
