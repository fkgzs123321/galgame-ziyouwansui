import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书/角色';
const ROSTER = ['凝玉','艾薇尔','崔蓓茜','歌坦妮','若尔娜','黛丝','贞德','白素青','谭雅','阿仙奴','许德拉','歌莉妮','唐蓓尔金娜','梦露','嘉宝','艾莉婕'];
const MIN = 12;

// 把整份文件拆成「按标点切的句子」，句子级比对（比滑窗诚实）
const sentences = (file) => {
  const raw = fs.readFileSync(file, 'utf8')
    .replace(/^@@[^\n]*$/gm, '')
    .split('\n')
    .filter((l) => !/^\s*<%_?/.test(l))
    .map((l) => l.replace(/^\s*[-:]?\s*[^:：]*[:：]\s*/, ''))   // 剥掉 "键: " 前缀
    .join('\n');
  const out = [];
  for (const seg of raw.split(/[。！？\n]+/)) {
    for (const s of seg.split(/[，；、：]/)) {
      const t = s.replace(/[「」（）()\[\]{}|"'\s]/g, '').trim();
      if (t.length >= MIN) out.push(t);
    }
  }
  return out;
};

const PAIRS = [
  ['基础信息', '私密'],
  ['性格调色盘', '私密阶段'],
  ['基础信息', '性格调色盘'],
  ['私密', '私密阶段'],
];

for (const [a, b] of PAIRS) {
  console.log(`\n${'='.repeat(58)}\n  ${a} × ${b}\n${'='.repeat(58)}`);
  let grand = 0, flagged = [];
  for (const n of ROSTER) {
    const fa = path.join(ROOT, n, a + '.yaml');
    const fb = path.join(ROOT, n, b + '.yaml');
    if (!fs.existsSync(fa) || !fs.existsSync(fb)) continue;
    const A = sentences(fa), B = sentences(fb);
    // 一句 A 若被某句 B 包含（>=12 字重叠）即算重复
    const hits = [];
    for (const x of A) {
      for (const y of B) {
        if (x === y || (x.length >= MIN && y.includes(x)) || (y.length >= MIN && x.includes(y))) { hits.push(x); break; }
        // 长句部分重叠：取最长公共子串
        let best = 0;
        for (let i = 0; i + MIN <= x.length; i++) if (y.includes(x.slice(i, i + MIN))) { best = MIN; break; }
        if (best) { hits.push(x.slice(0, 40)); break; }
      }
    }
    grand += hits.length;
    if (hits.length) flagged.push(`${n}:${hits.length}`);
    console.log(`  ${n.padEnd(6)} ${String(hits.length).padStart(3)} 句`);
  }
  console.log(`  ${'—'.repeat(22)}\n  合计 ${grand} 句` + (flagged.length ? `  (${flagged.join(' ')})` : ''));
}
