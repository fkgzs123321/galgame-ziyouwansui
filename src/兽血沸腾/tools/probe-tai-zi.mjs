import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
// idx725 = 太子诞; chapter-index 给出起始行
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
const c = ci.find(x => x.idx === 725);
console.log('idx725 章:', c.章, '行', c.line);
const 起 = c.line - 1;
for (let i = 起; i < Math.min(起 + 120, txt.length); i++) {
  const L = txt[i];
  if (!L.trim()) continue;
  if (/母|妃|夫人|妻|生|怀|诞/.test(L)) console.log(`L${i + 1}  ${L.trim().slice(0, 170)}`);
}
