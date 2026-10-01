import fs from 'fs';
const P = 'src/兽血沸腾/世界书/NPC/寇涛.yaml';
const t = fs.readFileSync(P, 'utf8');
console.log('说话风格行:', JSON.stringify((t.match(/^  说话风格:.*$/m) || ['<未找到>'])[0].slice(0, 60)));
console.log('含「几乎」:', t.includes('几乎'));
// 手动模拟注入
const out = t.replace('  说话风格: ', '  说话风格: 几乎似乎——');
console.log('替换生效:', out !== t);
fs.writeFileSync(P, out, 'utf8');
