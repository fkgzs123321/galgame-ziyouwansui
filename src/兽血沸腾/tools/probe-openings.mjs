// 核验开场白与开局入口。
import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
console.log('══ state.first_messages ══');
for (const [i, f] of (st.first_messages ?? []).entries()) {
  const k = typeof f === 'string' ? Object.keys(st.first_messages[i]) : Object.keys(f);
  console.log(`   [${i}] ${JSON.stringify(f).slice(0, 130)}`);
}

console.log('\n══ 开场白目录 ══');
for (const f of fs.readdirSync('src/兽血沸腾/开场白').sort()) {
  const p = `src/兽血沸腾/开场白/${f}`;
  if (fs.statSync(p).isDirectory()) {
    const 子 = fs.readdirSync(p).sort().join(' ');
    console.log(`   ${f}/  → ${子}`);
  } else {
    const t = fs.readFileSync(p, 'utf8');
    console.log(`   ${f.padEnd(8)} ${String(fs.statSync(p).size).padStart(7)} B  占位符=${t.includes('<OpeningPlaceHolder/>')}  ${t.split('\n')[0].slice(0, 52)}`);
  }
}

console.log('\n══ 开局表单里的开局数 ══');
const 形 = fs.readFileSync('src/兽血沸腾/界面/开局表单/App.vue', 'utf8');
const m = 形.match(/const OPENINGS = \[([\s\S]*?)\n\]/);
if (m) {
  const 名 = [...m[1].matchAll(/名:\s*'([^']+)'/g)].map(x => x[1]);
  console.log(`   ${名.length} 个：${名.join(' / ')}`);
}
// 自定义开局入口
for (const w of ['自定义', '表单式', '说明式', '终盘', '决战']) {
  const c = 形.split(w).length - 1;
  console.log(`   「${w}」在开局表单出现 ${c} 次`);
}
