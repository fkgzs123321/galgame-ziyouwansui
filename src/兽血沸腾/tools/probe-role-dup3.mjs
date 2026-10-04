import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书/角色';
const ROSTER = ['凝玉','艾薇尔','崔蓓茜','歌坦妮','若尔娜','黛丝','贞德','白素青','谭雅','阿仙奴','许德拉','歌莉妮','唐蓓尔金娜','梦露','嘉宝','艾莉婕'];
const MIN = 12;

const sents = (file) => {
  const raw = fs.readFileSync(file, 'utf8')
    .replace(/^@@[^\n]*$/gm, '')
    .split('\n').filter((l) => !/^\s*<%_?/.test(l))
    .map((l) => l.replace(/^\s*[-:]?\s*[^:：]*[:：]\s*/, '')).join('\n');
  const out = [];
  for (const seg of raw.split(/[。！？\n]+/)) for (const s of seg.split(/[，；、：]/)) {
    const t = s.replace(/[「」（）()\[\]{}|"'\s]/g, '').trim();
    if (t.length >= MIN) out.push(t);
  }
  return out;
};

// 最长公共子串（>=12）
function lcs(a, b) {
  let best = '';
  for (let i = 0; i < a.length; i++)
    for (let j = i + MIN; j <= a.length; j++) {
      const seg = a.slice(i, j);
      if (seg.length > best.length && b.includes(seg)) best = seg;
    }
  return best;
}

for (const [a, b] of [['基础信息', '性格调色盘'], ['基础信息', '私密'], ['性格调色盘', '私密阶段'], ['私密', '私密阶段']]) {
  console.log(`\n${'#'.repeat(60)}\n#  ${a} × ${b}\n${'#'.repeat(60)}`);
  for (const n of ROSTER) {
    const fa = path.join(ROOT, n, a + '.yaml'), fb = path.join(ROOT, n, b + '.yaml');
    if (!fs.existsSync(fa) || !fs.existsSync(fb)) continue;
    const A = sents(fa), B = sents(fb);
    const found = new Set();
    for (const x of A) for (const y of B) {
      const s = lcs(x, y);
      if (s.length >= MIN) found.add(s);
    }
    if (!found.size) continue;
    // 去掉被更长的包含的
    const arr = [...found].filter((x) => ![...found].some((y) => y !== x && y.includes(x)));
    console.log(`\n  【${n}】${arr.length} 处`);
    arr.forEach((x) => console.log(`      ${x}`));
  }
}
