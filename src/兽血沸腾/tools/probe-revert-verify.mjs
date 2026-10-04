// 复查：回滚后状态 + 越权写入的全面扫描。
import fs from 'fs';
import path from 'path';

const 角色 = 'src/兽血沸腾/世界书/角色';
const 家 = fs.readdirSync(角色, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);

const 有私密 = [];
for (const n of 家) {
  const d = path.join(角色, n);
  const f = fs.readdirSync(d);
  if (f.includes('私密.yaml')) 有私密.push(n);
}
console.log(`══ 持有私密.yaml 的角色：${有私密.length} 人 ══`);
console.log('   ' + 有私密.sort().join('、'));

const 排除 = ['海伦.列娜', '茉儿', '茜茜', '姬丝凯碧', '喀秋莎', '海华丝'];
console.log('\n══ 裁定排除档位现状 ══');
for (const n of 排除) {
  const d = path.join(角色, n);
  if (!fs.existsSync(d)) { console.log(`   ${n.padEnd(12)} (目录不存在)`); continue; }
  const f = fs.readdirSync(d);
  const bad = f.filter(x => /私密/.test(x));
  console.log(`   ${n.padEnd(12)} ${bad.length ? '⚠ ' + bad.join(' + ') : '✓ 无私密文件'}   [${f.join(' ')}]`);
}

// 年龄复查
console.log('\n══ 四档年龄字段 ══');
for (const n of ['海伦.列娜', '茉儿', '茜茜', '姬丝凯碧']) {
  const p = path.join(角色, n, '基础信息.yaml');
  const t = fs.readFileSync(p, 'utf8');
  const m = t.match(/^\s*年龄:.*$/m);
  console.log(`   ${n.padEnd(12)} ${m ? m[0].trim() : '(无)'}`);
}

// 越权写入扫描：找出 06:20 UTC 之后被改过的世界书文件
console.log('\n══ 06:20 UTC 之后被改动的世界书文件 ══');
const 限 = Date.UTC(2024, 0, 1); // placeholder
const now = Date.now();
let n2 = 0;
const walk = d => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    const st = fs.statSync(p);
    const 分钟 = (now - st.mtimeMs) / 60000;
    if (分钟 <= 45) { console.log(`   ${st.mtime.toISOString().slice(11, 19)}  ${p.replace(/\\/g, '/')}`); n2++; }
  }
};
walk('src/兽血沸腾/世界书');
console.log(`   共 ${n2} 个`);
