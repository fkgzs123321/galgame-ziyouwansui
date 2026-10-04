import fs from 'fs';
import path from 'path';
const ROOT = 'src/兽血沸腾';
const s = JSON.parse(fs.readFileSync(`${ROOT}/tavern-cards-state.json`, 'utf8'));
const M = s.entryManifest;

// 1. 故事大纲里的 660 characters
const ol = fs.readFileSync(`${ROOT}/故事大纲.yaml`, 'utf8');
const names = [...ol.matchAll(/^ {2}([^\s:#][^:]{0,28}):\s*$/gm)].map(m => m[1]);

// 2. 角色速览里登记的
const cat = fs.readFileSync(`${ROOT}/世界书/角色/角色速览.yaml`, 'utf8');
const catNames = [...cat.matchAll(/-\s*姓名:\s*'?([^'\n]+)'?/g)].map(m => m[1].trim());

// 3. 有 basic 条目的
const basic = new Set(Object.keys(M['角色']).filter(k => k.endsWith('_基础信息')).map(k => k.replace(/_基础信息$/, '')));
const pers = new Set(Object.keys(M['角色']).filter(k => k.endsWith('_性格调色盘')).map(k => k.replace(/_性格调色盘$/, '')));
const npc = new Set(Object.keys(M['NPC']));

console.log('══ 三层结构实测 ══\n');
console.log(`  L1 核心角色（有 基础信息）      : ${basic.size} 人`);
console.log(`     其中有 性格调色盘          : ${pers.size} 人`);
console.log(`  L2 NPC（功能角色）             : ${npc.size} 人`);
console.log(`  L3 角色速览（仅索引）           : ${catNames.length} 人`);
console.log(`  故事大纲 characters 条目        : 660`);

const covered = new Set([...basic, ...npc, ...catNames]);
console.log(`\n  三层并集覆盖                    : ${covered.size} 人`);

console.log('\n══ 只在速览里、没有独立条目的人（前 30）══');
const onlyCat = catNames.filter(n => !basic.has(n) && !npc.has(n));
console.log(`  共 ${onlyCat.length} 人: ${onlyCat.slice(0, 30).join('、')}`);

console.log('\n══ 速览收录了但没独立条目也没被剧情用到的人 ══');
console.log(`  （速览 = 名单层的答案）`);

console.log('\n══ 事件条目承载剧情：谁在事件里出现 ══');
const evDir = path.join(ROOT, '世界书/事件');
let evText = '';
for (const f of fs.readdirSync(evDir)) evText += fs.readFileSync(path.join(evDir, f), 'utf8');
const mentioned = catNames.filter(n => evText.includes(n));
console.log(`  速览里的 ${catNames.length} 人中，有 ${mentioned.length} 人在 48 篇事件条目里被写到`);
