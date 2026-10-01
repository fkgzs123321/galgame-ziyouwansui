// 复核 永贝里 条目：名字撞名裁定说有两个永贝里，本条目写的是哪一个？
import fs from 'fs';

const 行 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const 章 = [];
for (let i = 0; i < 行.length; i++) if (/^\s*第[一二三四五六七八九十百千零]+章\s/.test(行[i])) 章.push(i);
const 行到章 = i => { let c = 0; for (const h of 章) if (h <= i) c++; else break; return c - 1; };

const 永 = 行.map((l, i) => [i, l]).filter(([, l]) => l.includes('永贝里'));
console.log(`══ 「永贝里」共 ${永.length} 行 ══\n`);
for (const [i, l] of 永) {
  const 特征 = [
    l.includes('刀') ? '刀' : '',
    l.includes('美杜莎') ? '美杜莎' : '',
    l.includes('盐') ? '盐' : '',
    l.includes('采玉城') ? '采玉城' : '',
    l.includes('肥罗') ? '肥罗' : '',
    l.includes('蛇蛊') ? '蛇蛊' : '',
  ].filter(Boolean).join('/');
  console.log(`   L${String(i).padEnd(7)} idx≈${String(行到章(i)).padEnd(4)} [${特征}]  ${l.trim().slice(0, 78)}`);
}

console.log('\n══ 「永贝里」+「美杜莎」 ══');
永.filter(([, l]) => l.includes('美杜莎')).forEach(([i, l]) => console.log(`   L${i} idx≈${行到章(i)}: ${l.trim().slice(0, 96)}`));
console.log('\n══ 「肥罗」+「永贝里」 ══');
永.filter(([, l]) => l.includes('肥罗')).forEach(([i, l]) => console.log(`   L${i} idx≈${行到章(i)}: ${l.trim().slice(0, 96)}`));
console.log('\n══ 「美杜莎刀圣」 ══');
行.map((l, i) => [i, l]).filter(([, l]) => l.includes('刀圣')).forEach(([i, l]) => console.log(`   L${i} idx≈${行到章(i)}: ${l.trim().slice(0, 96)}`));
