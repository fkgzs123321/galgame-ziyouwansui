// 判断 故事大纲.yaml 里 3 处「玛丽莲·梦露」是否位于逐字语料 text: 块内（若是则不可改）。
import fs from 'fs';

const L = fs.readFileSync('src/兽血沸腾/故事大纲.yaml', 'utf8').split('\n');
const 目标 = [9676, 17323, 25163]; // 0-based

for (const i of 目标) {
  // 向上找最近的一个「块起始键」（缩进更浅且以 词: 结尾，或 text: / context:）
  let j = i, 真 = null;
  while (j >= 0) {
    const m = L[j].match(/^(\s*)([^\s#][^:]*):\s*[|>]?\s*$/);
    if (m && m[1].length < L[i].match(/^\s*/)[0].length) { 真 = { 行: j + 1, 键: m[2], 缩进: m[1].length }; break; }
    j--;
  }
  console.log(`L${i + 1}: ${L[i].trim().slice(0, 80)}`);
  console.log(`   最近上级键 → L${真?.行} 「${真?.键}」(缩进 ${真?.缩进})  ⇒ ${真?.键 === 'text' ? '★ 逐字语料，禁改' : '作者撰写，可改'}`);
}

// 整个文件里 text: 块的数量，确认判定方法
console.log(`\n全文件 text: 块 ${L.filter(l => /^\s*text:/.test(l)).length} 个`);
console.log('全文件 context: 行 ' + L.filter(l => /^\s*context:/.test(l)).length + ' 个');
