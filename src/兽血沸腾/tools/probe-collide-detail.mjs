// 探针：加图索 与 保罗 的撞名实证。
import fs from 'fs';

const 行 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');
const 含 = s => 行.filter(l => l.includes(s));

console.log('══ 加图索 ══');
console.log(`   加图索 总 ${含('加图索').length} 行；含「丹泽」${含('加图索').filter(l => l.includes('丹泽')).length} 行`);
console.log('   「加图索」+团长 样本 3 行：');
含('加图索').filter(l => l.includes('团长')).slice(0, 3).forEach(l => console.log(`      ${l.trim().slice(0, 100)}`));
console.log('   「加图索」不含「丹泽」的样本 5 行：');
含('加图索').filter(l => !l.includes('丹泽')).slice(0, 5).forEach(l => console.log(`      ${l.trim().slice(0, 100)}`));

console.log('\n══ 保罗纽曼 vs 保罗.马尔蒂尼 ══');
console.log(`   保罗纽曼 ${含('保罗纽曼').length} 行`);
console.log(`   纽曼     ${含('纽曼').length} 行`);
console.log(`   保罗      ${含('保罗').length} 行`);
const 保 = 含('保罗');
console.log(`   保罗 且 纽曼 : ${保.filter(l => l.includes('纽曼')).length}`);
console.log(`   保罗 且 马尔蒂尼 : ${保.filter(l => l.includes('马尔蒂尼')).length}`);
console.log(`   保罗 且 圣保罗 : ${保.filter(l => l.includes('圣保罗')).length}`);
console.log('   「保罗」既不纽曼也不马尔蒂尼的样本 6 行：');
保.filter(l => !l.includes('纽曼') && !l.includes('马尔蒂尼')).slice(0, 6).forEach(l => console.log(`      ${l.trim().slice(0, 100)}`));

console.log('\n══ 乔治 ══');
含('乔治').forEach((l, i) => console.log(`   ${l.trim().slice(0, 105)}`));

console.log('\n══ 克里斯蒂安 ══');
含('克里斯蒂安').forEach(l => console.log(`   ${l.trim().slice(0, 105)}`));
