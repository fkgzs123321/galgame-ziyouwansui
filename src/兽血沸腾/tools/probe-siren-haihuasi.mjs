// 复核 塞壬 与 海华丝 是否为「应补私密的女性角色」。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数 = s => 原.split(s).length - 1;

for (const n of ['塞壬', '海华丝']) {
  console.log(`\n═══════ ${n}（全程 ${数(n)} 命中）═══════`);
  console.log('── 条目文件 ──');
  for (const p of [`src/兽血沸腾/世界书/角色/${n}/基础信息.yaml`, `src/兽血沸腾/世界书/NPC/${n}.yaml`]) {
    if (fs.existsSync(p)) {
      const t = fs.readFileSync(p, 'utf8');
      console.log(`   ${p}`);
      t.split('\n').slice(0, 14).forEach(l => console.log(`      ${l.slice(0, 120)}`));
    }
  }
  console.log('── 原文前 6 行 ──');
  let c = 0;
  行.forEach((l, i) => { if (l.includes(n) && c < 6) { console.log(`   L${i}: ${l.trim().slice(0, 140)}`); c++; } });
}
