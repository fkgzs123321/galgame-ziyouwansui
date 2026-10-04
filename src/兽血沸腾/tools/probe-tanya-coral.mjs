// 核实：谭雅 与 珊瑚美人 是否为同一人。
// 疑点：两份基础信息都写「刘震撼给她起名谭雅」、都是圣井水晶人、都生下孪生男婴、都没有脉搏。
// 判定要看原文里「谭雅」出现处是否指「珊瑚美人」。
import fs from 'fs';

const TXT = 'src/兽血沸腾/兽血沸腾.txt';
const lines = fs.readFileSync(TXT, 'utf8').split('\n');

console.log('════ 1. 「谭雅」全部出现处（含上下文一行）════');
let n = 0;
lines.forEach((l, i) => {
  if (l.includes('谭雅')) {
    n++;
    if (n <= 60) console.log(`L${i + 1}| ${l.trim().slice(0, 150)}`);
  }
});
console.log(`\n「谭雅」总行数: ${n}`);

console.log('\n════ 2. 「珊瑚美人」出现行数 ════');
const coral = lines.map((l, i) => [i + 1, l]).filter(([, l]) => l.includes('珊瑚美人'));
console.log(`总行数: ${coral.length}`);

console.log('\n════ 3. 关键判定：「谭雅」与「珊瑚」共现的行 ════');
let both = 0;
lines.forEach((l, i) => {
  if (l.includes('谭雅') && /珊瑚|水晶人|美德罗|石化的|定型/.test(l)) {
    both++;
    console.log(`L${i + 1}| ${l.trim().slice(0, 170)}`);
  }
});
console.log(`\n共现行数: ${both}`);

console.log('\n════ 4. 「谭雅」与「海伦」或其他妻室并列的行（判断是否为独立妻室）════');
lines.forEach((l, i) => {
  if (l.includes('谭雅') && /海伦|凝玉|黛丝|若尔娜|艾薇尔|老板娘|老婆|夫人/.test(l))
    console.log(`L${i + 1}| ${l.trim().slice(0, 170)}`);
});

console.log('\n════ 5. 首次出现对比 ════');
const first = (kw) => {
  const i = lines.findIndex(l => l.includes(kw));
  return i < 0 ? null : `L${i + 1}: ${lines[i].trim().slice(0, 150)}`;
};
console.log('谭雅   首见 →', first('谭雅'));
console.log('珊瑚美人 首见 →', first('珊瑚美人'));
console.log('\n§ 创作规划 与 故事大纲 里两人的记录:');
for (const f of ['src/兽血沸腾/创作规划.yaml', 'src/兽血沸腾/故事大纲.yaml']) {
  const t = fs.readFileSync(f, 'utf8');
  for (const name of ['谭雅', '珊瑚美人']) {
    const idx = t.indexOf(`name: ${name}`);
    console.log(`  ${f.split(/[\\/]/).pop()} · ${name}: ${idx < 0 ? '无 characters 记录' : JSON.stringify(t.slice(idx, idx + 260)).slice(0, 260)}`);
  }
}
