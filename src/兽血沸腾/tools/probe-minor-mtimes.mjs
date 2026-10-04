// 只取时间戳，不读取露骨正文。
import fs from 'fs';
import path from 'path';

const 角色 = 'src/兽血沸腾/世界书/角色';
const 关注 = ['海伦.列娜', '茉儿', '茜茜', '姬丝凯碧'];

console.log('══ 四个「原文写明未成年」档位的文件时间戳 ══\n');
for (const n of 关注) {
  const d = path.join(角色, n);
  console.log(`── ${n} ──`);
  for (const f of fs.readdirSync(d).sort()) {
    const st = fs.statSync(path.join(d, f));
    console.log(`   ${f.padEnd(20)} ${String(st.size).padStart(6)} B  ${st.mtime.toISOString().slice(0, 19)}`);
  }
}

// 对照：确认是成年人的档位，私密文件的创建时间
console.log('\n══ 对照：成年档位的私密文件时间戳 ══');
for (const n of ['凝玉', '艾薇尔', '贞德']) {
  const p = path.join(角色, n, '私密.yaml');
  if (!fs.existsSync(p)) { console.log(`   ${n} 无私密`); continue; }
  const st = fs.statSync(p);
  console.log(`   ${n.padEnd(8)} ${String(st.size).padStart(6)} B  ${st.mtime.toISOString().slice(0, 19)}`);
}
