// 只读：为「纪元软降级」的 245 处，从原文自动提取「该说法何时才成立」的首现章节。
// 产出 tools/demote-thresholds.json，供人工复核后写进各 基础信息.yaml 的分档。
import fs from 'fs';

const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
const queue = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/demote-queue.json', 'utf8'));

function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }

// 纪年锚点词表：这些词出现得越晚，说明该说法越晚才成立
const 锚词 = [
  '剑桥大祭师', '剑桥祭祀学院', '领主夫人', '第一任院长', '红衣大祭司', '维安大萨满',
  '神曲萨满', '摄政公爵', '大内侍卫', '奴隶战士', '苍穹先知', '先知袍', '花王',
  '花中皇后', '王后', '皇后', '教女', '珠胎', '母亲', '子嗣', '加冕', '册封', '追封',
  '第一夫人', '后宫', '婚约', '订婚', '夫婿', '丈夫', '妻子', '妻室', '成亲', '婚礼',
  '封地', '男爵', '子爵', '伯爵', '侯爵', '公爵', '大祭师', '权杖祭祀', '战争祭祀',
  '灵魂祭祀', '风语祭祀', '圣坛祭祀', '主祭', '长老', '族长', '城主', '亲王', '国王',
  '教皇', '教宗', '圣女', '龙骑士', '黄金龙骑士', '星界', '冥界', '巫妖', '堕落天使',
  '大魔导师', '魔导师', '大魔法师', '魔法师', '城主', '领主', '院长', '首席', '团長', '团长',
];
const 未来词 = /后为|后任|后来|最终|结局|终成|升任|改任|继任|即位|称帝|追封|此后|日后|最后成|成为|当上|被提为|新任/;

// 角色名 → 用于在原文里定位的检索串（取第一段，兼容 ASCII 点与间隔号）
function 检索串(名) {
  const s = new Set([名]);
  const 段 = 名.split(/[.·]/);
  if (段.length > 1) { s.add(段[0]); s.add(段.join('')); }
  return [...s];
}

const 索引 = new Map(); // 检索串 → [[idx, 行, 文本]]
for (const q of queue) {
  for (const s of 检索串(q.名)) {
    if (索引.has(s)) continue;
    const hits = [];
    for (let i = 0; i < txt.length; i++) if (txt[i].includes(s)) hits.push([行到idx(i + 1), i + 1, txt[i]]);
    hits.sort((a, b) => a[0] - b[0]);
    索引.set(s, hits);
  }
}

const out = [];
for (const q of queue) {
  const 串 = 检索串(q.名);
  const 锚 = [];
  for (const w of 锚词) {
    if (!q.文.includes(w)) continue;
    let 首 = null;
    for (const s of 串) {
      const h = (索引.get(s) || []).find(x => x[2].includes(w));
      if (h && (首 === null || h[0] < 首)) 首 = h[0];
    }
    锚.push({ 词: w, 首idx: 首 });
  }
  out.push({
    名: q.名, 桶: q.桶, 节: q.节 ?? null, 键: q.键, 行: q.行, 文件: q.文件,
    建议下界: q.建议下界 ?? null,
    有未来词: 未来词.test(q.文),
    锚, 文: q.文,
  });
}

fs.writeFileSync('src/兽血沸腾/tools/demote-thresholds.json', JSON.stringify(out, null, 1), 'utf8');

// 控制台概览：逐文件列出，便于人工逐档复核
const byFile = new Map();
for (const r of out) { if (!byFile.has(r.文件)) byFile.set(r.文件, []); byFile.get(r.文件).push(r); }
console.log(`文件 ${byFile.size} 个，条目 ${out.length} 处\n`);
for (const [f, rows] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`════ ${f}  （${rows.length} 处）`);
  for (const r of rows.sort((a, b) => a.行 - b.行)) {
    const 锚s = r.锚.map(a => `${a.词}=${a.首idx ?? '无'}`).join(' ');
    console.log(`  L${String(r.行).padStart(3)} [${r.桶}] ${r.节 ? r.节 + '/' : ''}${r.键}  建议下界=${r.建议下界 ?? '空'}${r.有未来词 ? ' 未来词' : ''}`);
    console.log(`       锚: ${锚s || '（无）'}`);
    console.log(`       文: ${r.文.slice(0, 100)}`);
  }
}
console.log('\n→ 已写 tools/demote-thresholds.json');
