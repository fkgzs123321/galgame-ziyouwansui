// 时间戳对比：pack 产物是否早于最近的源文件改动。
import fs from 'fs';
import path from 'path';

const 看 = [
  'src/兽血沸腾/兽血沸腾.json',
  'dist/兽血沸腾/界面/状态栏/index.html',
  'dist/兽血沸腾/界面/开局表单/index.html',
  'src/兽血沸腾/界面/私密部位.ts',
  'src/兽血沸腾/界面/私密档位.ts',
  'src/兽血沸腾/tavern-cards-state.json',
];
const t = p => fs.existsSync(p) ? fs.statSync(p).mtime : null;
const fmt = d => d ? d.toISOString().replace('T', ' ').slice(0, 19) : '（不存在）';

console.log('══ 产物时间戳 ══');
for (const p of 看) console.log(`   ${p.replace('src/兽血沸腾/', '').padEnd(42)} ${fmt(t(p))}`);

// 最近改动的世界书文件
const 列 = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.ya?ml$/.test(e.name)) 列.push([p, fs.statSync(p).mtime]);
  }
})('src/兽血沸腾/世界书');
列.sort((a, b) => b[1] - a[1]);

console.log('\n══ 最近改动的 10 个世界书文件 ══');
for (const [p, m] of 列.slice(0, 10)) {
  console.log(`   ${fmt(m)}  ${p.replace('src/兽血沸腾/世界书/', '')}`);
}

const 卡 = t('src/兽血沸腾/兽血沸腾.json');
const 更晚 = 列.filter(([, m]) => m > 卡);
console.log(`\n══ pack 之后又被改过的世界书文件：${更晚.length} 个 ══`);
for (const [p, m] of 更晚) console.log(`   ${fmt(m)}  ${p.replace('src/兽血沸腾/世界书/', '')}`);
