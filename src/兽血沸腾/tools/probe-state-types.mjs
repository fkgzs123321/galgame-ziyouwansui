// 只读：state.json 的条目类型清单与位置/策略默认值。
import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
console.log('顶层键: ' + Object.keys(st).join(' · '));
console.log('\nentryManifest 类型:');
for (const [k, v] of Object.entries(st.entryManifest)) {
  const n = Array.isArray(v) ? v.length : Object.keys(v).length;
  console.log(`   ${k.padEnd(10)} ${n} 条`);
}
console.log('\ntypeLists: ' + JSON.stringify(st.typeLists ?? st.strategyThresholds ?? {}, null, 2).slice(0, 800));
console.log('\n其他: ' + JSON.stringify(Object.fromEntries(Object.entries(st).filter(([k]) => k !== 'entryManifest')), null, 2).slice(0, 2500));
