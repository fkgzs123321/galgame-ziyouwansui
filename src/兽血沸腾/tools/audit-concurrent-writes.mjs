// 紧急：完整盘点「私密文件」分布 + 年龄字段 vs 原文，并检测是否有并发写入。
import fs from 'fs';
import path from 'path';

const 角色 = 'src/兽血沸腾/世界书/角色';
const 快照 = () => {
  const m = {};
  for (const d of fs.readdirSync(角色)) {
    const p = path.join(角色, d);
    if (!fs.statSync(p).isDirectory()) continue;
    for (const f of fs.readdirSync(p)) m[d + '/' + f] = fs.statSync(path.join(p, f)).mtimeMs;
  }
  return m;
};

const a = 快照();
await new Promise(r => setTimeout(r, 15000));
const b = 快照();

const 变 = Object.keys(b).filter(k => a[k] !== b[k]);
const 新 = Object.keys(b).filter(k => !(k in a));
console.log('══ 15 秒内的并发写入 ══');
console.log(变.length || 新.length ? `   ⚠ 改动 ${变.length} 个，新增 ${新.length} 个` : '   ✓ 无写入（写入已停止）');
for (const k of 变) console.log(`      改 ${k}`);
for (const k of 新) console.log(`      新 ${k}`);

// 私密文件全盘点
console.log('\n══ 持有「私密.yaml」的角色 ══');
const 有 = [];
for (const d of fs.readdirSync(角色).sort()) {
  const p = path.join(角色, d);
  if (!fs.statSync(p).isDirectory()) continue;
  const f = fs.readdirSync(p);
  if (f.some(x => x === '私密.yaml')) 有.push(d);
}
console.log(`   共 ${有.length} 人：${有.join('、')}`);

const 排除 = ['海伦.列娜', '茉儿', '茜茜', '姬丝凯碧', '喀秋莎', '海华丝'];
console.log('\n══ 裁定为「不写 NSFW」的档位现状 ══');
for (const n of 排除) {
  const p = path.join(角色, n);
  if (!fs.existsSync(p)) { console.log(`   ${n.padEnd(10)} 目录不存在`); continue; }
  const f = fs.readdirSync(p);
  const 私 = f.filter(x => /私密/.test(x));
  console.log(`   ${n.padEnd(10)} ${私.length ? '⚠ ' + 私.join(' + ') : '✓ 无私密'}   [${f.join(' ')}]`);
}
