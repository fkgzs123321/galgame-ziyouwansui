// 原 角色速览.yaml 里除去人名录之外，还有一段「阵营速查」。
// 人名录已按纪元拆成 9 份，阵营速查不属于任何单一纪元（它是势力的常设归属表），
// 因此单独抽成一个文件，避免随旧速览一起被停用时丢失内容。
import fs from 'node:fs';

const 原 = fs.readFileSync('src/兽血沸腾/世界书/角色/角色速览.yaml', 'utf8');
const m = 原.match(/^阵营速查:[\s\S]*$/m);
if (!m) { console.error('原速览里找不到 阵营速查 段'); process.exit(1); }

const 段 = m[0].trimEnd();
fs.mkdirSync('src/兽血沸腾/世界书/角色/速览', { recursive: true });
fs.writeFileSync('src/兽血沸腾/世界书/角色/速览/阵营速查.yaml', 段 + '\n', 'utf8');
console.log('已抽出 阵营速查.yaml：');
console.log(段);
