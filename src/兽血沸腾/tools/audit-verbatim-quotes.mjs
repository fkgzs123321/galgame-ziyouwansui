// 探针：检查条目里的「逐字引文」是否真的逐字。
//
// 背景：`故事大纲.yaml` 的 text: 字段、以及各条的 `参考语料:` / `他人语料:` 块，
// 按纪律都是**逐字原文引用**，一个字都不许改（含原文的错字、异体字）。
// 但原文有大量 OCR 级错字（而己/多欺/砚在/形客/杀乞…），撰写时很容易「顺手改对」，
// 那就破坏了逐字性。这里把每一条引文拿去原文里做精确子串匹配，不中的报出来。
import fs from 'fs';
import path from 'path';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 角色根 = 'src/兽血沸腾/世界书/角色';

// 抽引文：以 「…」 或 “…” 包裹的整行，且位于 参考语料/他人语料 子树内。
const 引文 = [];
for (const n of fs.readdirSync(角色根)) {
  const d = path.join(角色根, n);
  if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d).filter(x => x.endsWith('.yaml'))) {
    const L = fs.readFileSync(path.join(d, f), 'utf8').split('\n');
    let 入语料 = false, 缩进 = -1;
    L.forEach((l, i) => {
      const m = l.match(/^(\s*)(参考语料|他人语料)\s*:/);
      if (m) { 入语料 = true; 缩进 = m[1].length; return; }
      if (入语料) {
        const ind = l.match(/^(\s*)/)[1].length;
        if (l.trim() === '') return;
        if (ind <= 缩进 && !/^\s*-/.test(l)) { 入语料 = false; return; }
      }
      if (!入语料) return;
      const q = l.match(/[「“]([^」”]{8,})[」”]/);
      if (q) 引文.push({ 角色: n, 文件: f, 行: i + 1, 文: q[1] });
    });
  }
}

let 坏 = 0;
for (const q of 引文) {
  if (原.includes(q.文)) continue;
  坏++;
  console.log(`\n【${q.角色}】${q.文件}.yaml L${q.行}  ✗ 原文无此串`);
  console.log(`   卡片: ${q.文.slice(0, 80)}`);
  // 找最像的原文行
  const 头 = q.文.slice(0, 10);
  const cand = 原.split('\n').filter(l => l.includes(头));
  if (cand.length) console.log(`   原文: ${cand[0].trim().slice(0, 80)}`);
  else console.log('   原文: （连开头 10 字都找不到）');
}
console.log(`\n══ 共 ${引文.length} 条引文，逐字不符 ${坏} 条 ══`);
