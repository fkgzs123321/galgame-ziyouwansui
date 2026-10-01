import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
const NEW = ['贝克汉姆', '菲高', '贝肯鲍尔', '普斯卡什大师', '冬五', '古德', '维埃里', '贝拉米', '科里纳', '奥尼尔', '罗德曼'];

console.log('══ 新 NPC 文件的一级键与语料条数 ══');
for (const n of NEW) {
  const p = path.join(NPC, n + '.yaml');
  if (!fs.existsSync(p)) { console.log(`  ${n}: 文件不存在`); continue; }
  const t = fs.readFileSync(p, 'utf8');
  const L = t.split('\n');
  const top = [...t.matchAll(/^([^\s#][^:]*):/gm)].map(m => m[1]);
  const quotes = (t.match(/^ {4,}- /gm) || []).length;
  // 参考语料块内的行数
  const qi = L.findIndex(l => /^参考语料:/.test(l));
  const qn = qi < 0 ? 0 : L.slice(qi).filter(l => /^\s+- /.test(l)).length;
  console.log(`  ${n.padEnd(7)} ${String(t.length).padStart(5)} B  键=[${top.join(',')}]  语料 ${qn} 条`);
}

console.log('\n══ 各新文件是否含私密/NSFW 内容（NPC 不应有） ══');
for (const n of NEW) {
  const t = fs.readFileSync(path.join(NPC, n + '.yaml'), 'utf8');
  const bad = /私密|房事|名器|奶子|性癖|后宫/.test(t);
  if (bad) console.log(`  ⚠ ${n} 含 NSFW 词`);
}
console.log('  （无输出即全部干净）');
