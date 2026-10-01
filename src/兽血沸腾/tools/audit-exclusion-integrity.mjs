// 重点：6 个「排除档」（不得写 NSFW）现在是否被人为改成成年，或新增了 NSFW 文件。
import fs from 'fs';
import path from 'path';

const 排除 = ['海伦.列娜', '茉儿', '茜茜', '姬丝凯碧', '喀秋莎', '海华丝'];
const 角色 = 'src/兽血沸腾/世界书/角色';

console.log('══ 排除档目录内容与是否出现 NSFW 文件 ══');
for (const n of 排除) {
  const d = path.join(角色, n);
  if (!fs.existsSync(d)) { console.log(`   ✗ ${n} 目录不存在`); continue; }
  const fs_ = fs.readdirSync(d);
  const 私密 = fs_.filter(f => /私密/.test(f));
  const st = fs.statSync(d);
  console.log(`   ${n.padEnd(12)} ${fs_.length} 文件  ${私密.length ? '⚠ 含 ' + 私密.join(',') : '✓ 无私密'}  [${st.mtime.toISOString().slice(0, 19)}]`);
  for (const f of fs_) {
    const p = path.join(d, f);
    console.log(`         ${f.padEnd(20)} ${fs.statSync(p).size} B  ${fs.statSync(p).mtime.toISOString().slice(11, 19)}`);
  }
}

// 年龄字段当前值
console.log('\n══ 各档「年龄」字段当前写法 vs 原文 ══');
for (const n of 排除) {
  const p = path.join(角色, n, '基础信息.yaml');
  if (!fs.existsSync(p)) continue;
  const t = fs.readFileSync(p, 'utf8');
  const m = t.match(/^\s*年龄:.*$/m);
  console.log(`   ${n.padEnd(12)} ${m ? m[0].trim() : '(无年龄字段)'}`);
}

// 原文权威值
const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
console.log('\n══ 原文里的权威年龄表述 ══');
for (const w of ['看上去年纪最多十四五岁', '茜茜还未到成年礼', '茉儿今年多大？十一岁', '姬丝凯碧小姐还没发育', '还没有发育完全']) {
  console.log(`   「${w}」 → ${原.split(w).length - 1} 次`);
}
