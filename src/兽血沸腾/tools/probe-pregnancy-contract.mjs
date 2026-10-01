// 补核验：孕事阶段契约在 schema / 世界观条目 / HaremPanel 的三方一致性。
import fs from 'fs';
import path from 'path';

const GS = 'src/兽血沸腾/世界书';

// 找到所有含「孕事」的世界书条目
const 命中 = [];
const 走 = d => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) 走(p);
    else if (f.endsWith('.yaml')) {
      const t = fs.readFileSync(p, 'utf8');
      if (t.includes('孕事')) 命中.push([p.replace(/\\/g, '/'), t]);
    }
  }
};
走(GS);

const 阶 = ['确诊', '显怀', '临产', '分娩'];
console.log('── 含「孕事」的世界书条目 ──');
for (const [p, t] of 命中) {
  const 有 = 阶.filter(s => t.includes(s));
  console.log(`   ${p.replace(GS + '/', '').padEnd(34)} ${有.length}/4  ${有.join('·')}`);
}

// schema 里 孕事 / 子嗣 的定义
const schema = fs.readFileSync('src/兽血沸腾/schema.ts', 'utf8').split('\n');
console.log('\n── schema.ts 里 孕事/子嗣 定义 ──');
schema.forEach((l, i) => { if (/孕事|子嗣|孕期|临产|分娩|显怀/.test(l)) console.log(`   L${i + 1}: ${l.trim()}`); });

// HaremPanel 的交互（兼容 const 箭头函数）
const panel = fs.readFileSync('src/兽血沸腾/界面/状态栏/components/HaremPanel.vue', 'utf8');
console.log('\n── HaremPanel 的函数/处理器 ──');
const 见 = new Set();
for (const m of panel.matchAll(/(?:function|const)\s+([\u4e00-\u9fa5A-Za-z_$][\w$]*)\s*=?\s*(?:async\s*)?\(/g)) 见.add(m[1]);
console.log('   ' + [...见].join(' · '));
console.log('\n── HaremPanel 里的孕事相关行 ──');
panel.split('\n').forEach((l, i) => { if (/孕事|确诊|显怀|临产|分娩|子嗣/.test(l)) console.log(`   L${i + 1}: ${l.trim().slice(0, 130)}`); });
