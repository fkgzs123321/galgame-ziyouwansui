// 复核 加茜娅/私密阶段.yaml L29 的「龙契烙印」。
// 「龙契」全程 0 命中 ⇒ 臆造。看有没有原文真有的替代表述。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数 = s => 原.split(s).length - 1;

for (const w of ['龙契', '后心', '契约', '龙骑士契约', '龙之契约', '龙血契约', '印记', '刺青', '烙印']) {
  console.log(`   ${w.padEnd(12)} ${数(w)}`);
}

console.log('\n══ 「后心」命中行 ══');
行.forEach((l, i) => { if (l.includes('后心')) console.log(`   L${i}: ${l.trim().slice(0, 120)}`); });

console.log('\n══ 「烙印」命中行（前 10）══');
let c = 0;
行.forEach((l, i) => { if (l.includes('烙印') && c < 10) { console.log(`   L${i}: ${l.trim().slice(0, 120)}`); c++; } });

console.log('\n══ 「龙骑士」+「契约」共现行 ══');
行.forEach((l, i) => { if (l.includes('龙骑士') && l.includes('契约')) console.log(`   L${i}: ${l.trim().slice(0, 130)}`); });

console.log('\n══ 加茜娅 + 龙背/第一次飞 ══');
行.forEach((l, i) => { if (l.includes('加茜娅') && /第一次飞|龙背/.test(l)) console.log(`   L${i}: ${l.trim().slice(0, 130)}`); });
