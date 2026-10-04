// 修 故事大纲.yaml 里 3 处臆造的「玛丽莲·梦露」。
//
// 原文只写「玛丽莲」（2 处：L125839、L127965），「玛丽莲·梦露」全程 0 命中。
// 这 3 处都在作者撰写的字段（key_members / characters / quotes.context）里，
// 不在逐字语料 text: 块内，可以改。
import fs from 'fs';

const F = 'src/兽血沸腾/故事大纲.yaml';
let t = fs.readFileSync(F, 'utf8');

const 前 = t.split('玛丽莲·梦露').length - 1;
if (前 !== 3) { console.log(`⚠ 命中 ${前} 次，期望 3，中止`); process.exit(1); }

t = t.replaceAll('玛丽莲·梦露', '玛丽莲');
fs.writeFileSync(F, t, 'utf8');

console.log(`✓ 故事大纲.yaml：玛丽莲·梦露 → 玛丽莲，共 ${前} 处`);
console.log(`  残留：${t.split('玛丽莲·梦露').length - 1}`);
