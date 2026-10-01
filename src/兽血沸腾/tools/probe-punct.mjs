import fs from 'fs';
const F4 = 'src/兽血沸腾/世界书/NPC/四殿下.yaml';
const line = fs.readFileSync(F4, 'utf8').split('\n').find(l => l.startsWith('  说话风格'));
console.log('原文:', JSON.stringify(line));
console.log('码点:', [...line].map(c => c.codePointAt(0).toString(16)).join(' '));
