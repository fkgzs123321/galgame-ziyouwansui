import fs from 'fs';
const raw = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
console.log('总行数', raw.length);
for (let i = 0; i < 6; i++) {
  const l = raw[i];
  console.log(`[${i}] len=${l.length} codes=${[...l.slice(0, 12)].map(c => c.codePointAt(0).toString(16)).join(',')} :: ${JSON.stringify(l.slice(0, 60))}`);
}
const HEAD = /^\uFEFF?\s*第([零一二三四五六七八九十百千两]+)章[章\s　]*(.*)$/;
console.log('HEAD on line 4:', HEAD.test(raw[4]), JSON.stringify(raw[4]));
const HEAD2 = /^第[0-9A-Za-z一二三四五六七八九十百千零〇两]{1,10}章/;
console.log('HEAD2 on trimmed line 4:', HEAD2.test(raw[4].trim()));
// 逐行统计
let a = 0, b = 0;
for (const l of raw) { if (HEAD.test(l)) a++; if (HEAD2.test(l.trim())) b++; }
console.log(`HEAD 命中 ${a} / HEAD2 命中 ${b}`);
