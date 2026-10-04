import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

console.log('══ 性格调色盘条目的注册方式统计 ══');
let pathCnt = 0, contCnt = 0;
for (const [k, v] of Object.entries(st.entryManifest['角色'])) {
  if (!k.endsWith('_性格调色盘')) continue;
  const how = v.path ? 'path' : 'contents';
  if (v.path) pathCnt++; else contCnt++;
  const file = v.path ?? v.contents?.find(c => c.file)?.file;
  const src = fs.readFileSync(`src/兽血沸腾/${file}`, 'utf8');
  console.log(`  ${k.padEnd(24)} ${how.padEnd(9)} EJS首行=${/^@@/.test(src) ? 'Y' : 'N'}  ${src.length}B`);
}
console.log(`\n  path=${pathCnt}  contents=${contCnt}`);

console.log('\n══ 果果/壹条/安度兰长老 是否在 魔宠 与 关系 中 ══');
const iv = fs.readFileSync('src/兽血沸腾/世界书/变量/initvar.yaml', 'utf8');
for (const sec of ['关系', '魔宠']) {
  const i = iv.split('\n').findIndex(l => new RegExp(`^${sec}:`).test(l));
  const lines = iv.split('\n');
  const keys = [];
  for (let j = i + 1; j < lines.length; j++) {
    if (/^[^\s]/.test(lines[j])) break;
    const m = lines[j].match(/^  (\S+?):/);
    if (m) keys.push(m[1]);
  }
  console.log(`  ${sec}: ${keys.join('、')}`);
}
