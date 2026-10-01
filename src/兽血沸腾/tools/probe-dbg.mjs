import fs from 'fs';
const raw = fs.readFileSync('src/兽血沸腾/世界书/角色/刘震撼/基础信息.yaml', 'utf8');
const lines = raw.split('\n');
const 控制行 = /^\s*<%_\s*(.*?)\s*_%>\s*$/;
for (let i = 7; i < 20; i++) {
  const L = lines[i];
  const m = L.match(控制行);
  console.log(`L${i + 1}  匹配=${!!m}`);
  if (m) {
    console.log(`     code=${JSON.stringify(m[1])}`);
    console.log(`     if匹配=${!!m[1].match(/if\s*\((.*)\)\s*\{?\s*$/)}`);
    console.log(`     elseif=${/^\}\s*else\s+if/.test(m[1])}  else=${/^\}\s*else\s*\{?\s*$/.test(m[1])}`);
    console.log(`     closes=${(m[1].replace(/\([^()]*\)/g, '()').match(/\}/g) || []).length}`);
  }
}
