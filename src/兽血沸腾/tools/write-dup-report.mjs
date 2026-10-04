// 把重复报告写进文件（用 node 自己写，避免 PowerShell 重定向改成 UTF-16）。
import { execFileSync } from 'child_process';
import fs from 'fs';

const out = execFileSync(process.execPath, ['src/兽血沸腾/tools/audit-cross-entry-dup-prose.mjs'], {
  cwd: process.cwd(), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
});
fs.writeFileSync('src/兽血沸腾/tools/dup-prose-report.txt', out, 'utf8');

// 按角色块解析：本报告的角色行格式是 `   朝河兰          9`（缩进 + 名 + 空格 + 数），
// 不是 `【朝河兰】9 处`，早前用后者做正则得到全 0 是假阴性。
const 块 = out.split('按角色（正文）：')[1] || '';
const 计数 = {};
for (const m of 块.matchAll(/^\s{2,}(\S+)\s+(\d+)\s*$/gm)) 计数[m[1]] = +m[2];

const 名 = ['波姬小丝', '朝河兰', '加茜娅', '费雯丽', '赫莲娜', '珍妮佛', '歌坦妮', '幽月儿', '安瑞达', '梦露', '艾莉婕', '伦娜', '艾薇尔', '崔蓓茜', '白素青', '谭雅', '阿仙奴'];
let 余 = 0;
console.log('══ 各角色正文重复 ══');
for (const n of 名) {
  const c = 计数[n] || 0;
  余 += c;
  console.log(`  ${n.padEnd(8)} ${c ? c + ' 处' : '✓ 0'}`);
}
const 未列 = Object.keys(计数).filter(n => !名.includes(n));
if (未列.length) console.log(`  （名册外还有：${未列.map(n => n + ' ' + 计数[n]).join('、')}）`);
const t = out.match(/正文重复 (\d+) 处/);
console.log(`\n  ${t ? t[0] : '（无重复）'}　名册内合计 ${余} 处`);
console.log(`  报告已写入 src/兽血沸腾/tools/dup-prose-report.txt（${Buffer.byteLength(out)} B）`);
