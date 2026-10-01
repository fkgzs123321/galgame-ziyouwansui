import fs from 'fs';
import path from 'path';
const ROOT = 'src/兽血沸腾';
const s = JSON.parse(fs.readFileSync(`${ROOT}/tavern-cards-state.json`, 'utf8'));
const G = s.entryManifest['地理'] ?? {};
const k0 = Object.keys(G)[0];
console.log('地理 条目数:', Object.keys(G).length);
console.log('样本:', k0, JSON.stringify(G[k0], null, 2).slice(0, 500));
