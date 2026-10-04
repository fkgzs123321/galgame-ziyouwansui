import fs from 'fs';
const P = 'src/兽血沸腾/世界书/NPC/寇涛.yaml';
let t = fs.readFileSync(P, 'utf8');
const before = t;
t = t.replace('  说话风格: 几乎似乎——', '  说话风格: ');
fs.writeFileSync(P, t, 'utf8');
console.log('已清除注入:', t !== before);
console.log('说话风格:', (t.match(/^  说话风格:.*$/m) || [''])[0].slice(0, 70));
