// 看 state 里 地理 的真实结构。
import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
console.log('顶层键：' + Object.keys(st).join(' · '));
console.log('entryManifest 键：' + Object.keys(st.entryManifest ?? {}).join(' · '));
const 地 = st.entryManifest?.地理;
console.log('地理 类型：' + (Array.isArray(地) ? 'array len=' + 地.length : typeof 地));
console.log('\n第一个元素：\n' + JSON.stringify(地?.[0], null, 2).slice(0, 1200));
