// 只读：era-table.json 的 登场 取值空间核对——是否 0..763、是否与 9 纪元窗口自洽。
import fs from 'fs';
const era = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-table.json', 'utf8'));
console.log('顶层键: ' + Object.keys(era).join(' · '));
console.log('纪元: ' + JSON.stringify(era.纪元));
const 表 = era.表;
console.log(`表 ${表.length} 行；字段: ${Object.keys(表[0]).join(',')}`);

const 登场 = 表.map(r => r.登场).filter(v => typeof v === 'number');
console.log(`\n登场 数值 ${登场.length} 个；min ${Math.min(...登场)} max ${Math.max(...登场)}`);
const 非数 = 表.filter(r => typeof r.登场 !== 'number');
console.log(`登场 非数值 ${非数.length}: ${非数.map(r => r.名 + '=' + JSON.stringify(r.登场)).join(' , ')}`);

// 9 窗口
const W = [['荒岛篇',0,8],['胸罩岛篇',9,20],['海上篇',21,30],['多瑙大荒原篇',31,42],['博格村与领地初建',43,58],['翡冷翠领主期',59,72],['纵横·成长期',73,244],['纵横·扩张期',245,704],['纵横·终盘',705,763]];
const win = v => (W.find(([, a, b]) => v >= a && v <= b) || ['超出'])[0];
const dist = {};
for (const v of 登场) dist[win(v)] = (dist[win(v)] || 0) + 1;
console.log('\n登场按窗口分布:');
for (const [n] of W) console.log(`  ${n.padEnd(18)} ${dist[n] || 0}`);

// 与 纪元 字段是否一致
let 不一致 = 0;
for (const r of 表) if (typeof r.登场 === 'number' && r.纪元 && r.纪元 !== win(r.登场)) { 不一致++; if (不一致 <= 12) console.log(`  ✗ ${r.名} 登场${r.登场} 窗口${win(r.登场)} 但表里写「${r.纪元}」`); }
console.log(`\n登场 与 纪元字段 不一致: ${不一致}`);

// 抽样
console.log('\n抽样 20 行:');
for (const r of 表.filter((_, i) => i % Math.ceil(表.length / 20) === 0))
  console.log(`  ${String(r.名).padEnd(14)} 类型${String(r.类型).padEnd(4)} 登场${String(r.登场).padStart(4)} 纪元「${r.纪元}」 文件${r.文件}`);
