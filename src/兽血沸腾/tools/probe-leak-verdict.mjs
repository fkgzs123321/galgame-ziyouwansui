// 复核前向泄漏的 9 行里，锚点词究竟是「晚出的专名」还是「早就有的一般说法」。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数 = s => 原.split(s).length - 1;

// 章节标题行号表：第 N 章（去重后 idx）→ 行号
const 章 = [];
for (let i = 0; i < 行.length; i++) {
  const m = 行[i].match(/^\s*第[一二三四五六七八九十百千零]+章\s/);
  if (m) 章.push(i);
}
console.log(`章节标题 ${章.length} 个`);

const 首现行 = s => { const i = 行.findIndex(l => l.includes(s)); return i; };
const 行到章 = i => { let c = 0; for (const h of 章) if (h <= i) c++; else break; return c - 1; };

const 查 = ['采玉城', '山丘之王', '太保团', '航空兵', '翡冷翠', '矮人王', '矮人'];
for (const w of 查) {
  const i = 首现行(w);
  console.log(`   ${w.padEnd(10)} 首见行 L${i}  ≈去重章 idx ${i >= 0 ? 行到章(i) : '?'}   全程 ${数(w)} 次`);
}

console.log('\n── 「山丘之王」是不是晚出的专名 ──');
const 丘 = 行.map((l, i) => [i, l]).filter(([, l]) => l.includes('山丘之王'));
console.log(`   共 ${丘.length} 行；最早 3 行：`);
丘.slice(0, 3).forEach(([i, l]) => console.log(`      L${i} (idx≈${行到章(i)}): ${l.trim().slice(0, 96)}`));

console.log('\n── 「罗德曼」在原文里是谁 ──');
const 罗 = 行.map((l, i) => [i, l]).filter(([, l]) => l.includes('罗德曼'));
console.log(`   共 ${罗.length} 行；最早 3 行：`);
罗.slice(0, 3).forEach(([i, l]) => console.log(`      L${i} (idx≈${行到章(i)}): ${l.trim().slice(0, 96)}`));
console.log(`   其中同时含「山丘之王」的：${罗.filter(([, l]) => l.includes('山丘之王')).length} 行`);
console.log(`   其中同时含「矮人」的：${罗.filter(([, l]) => l.includes('矮人')).length} 行`);
