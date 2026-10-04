// 输出 15 处整句重复的两侧完整行上下文，供逐条裁定。
// 切句逻辑与 audit-cross-entry-dup.mjs 完全一致，保证命中同一批。
import fs from 'fs';
import path from 'path';
const ROOT = 'src/兽血沸腾/世界书/角色';
const ROSTER = ['凝玉','艾薇尔','崔蓓茜','歌坦妮','若尔娜','黛丝','贞德','白素青','谭雅','阿仙奴','许德拉','歌莉妮','唐蓓尔金娜','梦露','嘉宝','艾莉婕'];
const FILES = ['基础信息', '性格调色盘', '私密', '私密阶段'];

const 正文 = t =>
  t.split('\n').filter(l => !/^\s*@@/.test(l) && !/<%/.test(l))
    .map(l => l.replace(/^\s*[^\s:]+:\s*/, '')).join('\n');

const 句 = t => 正文(t).split(/[。！？\n]/)
  .map(s => s.replace(/[，、；：""''「」（）\s]/g, '')).filter(s => s.length >= 12);

for (const n of ROSTER) {
  const S = {}, RAW = {};
  for (const f of FILES) {
    const p = path.join(ROOT, n, f + '.yaml');
    if (!fs.existsSync(p)) { S[f] = []; continue; }
    const t = fs.readFileSync(p, 'utf8');
    S[f] = 句(t); RAW[f] = t.split('\n');
  }
  const hits = [];
  for (let i = 0; i < FILES.length; i++) for (let j = i + 1; j < FILES.length; j++) {
    for (const a of new Set(S[FILES[i]])) for (const b of new Set(S[FILES[j]])) {
      let s = null;
      if (a === b) s = a;
      else if (a.length >= 14 && b.includes(a)) s = a;
      else if (b.length >= 14 && a.includes(b)) s = b;
      if (s) hits.push({ 对: `${FILES[i]}×${FILES[j]}`, 串: s, a: FILES[i], b: FILES[j] });
    }
  }
  const uniq = new Map();
  for (const h of hits) if (!uniq.has(h.串)) uniq.set(h.串, h);
  if (!uniq.size) continue;

  console.log(`\n${'═'.repeat(80)}\n【${n}】${uniq.size} 处\n`);
  let k = 0;
  for (const [s, h] of uniq) {
    k++;
    console.log(`  ── ${k}. 『${s}』  (${h.对})`);
    // 定位：在过滤后的正文里找该串，反查原始行
    for (const f of [h.a, h.b]) {
      const key = s.slice(0, 12);
      const idx = RAW[f].findIndex(l => {
        if (/^\s*@@/.test(l) || /<%/.test(l)) return false;
        const v = l.replace(/^\s*[^\s:]+:\s*/, '').replace(/[，、；：""''「」（）\s]/g, '');
        return v.includes(key);
      });
      if (idx >= 0) console.log(`     ${f}.yaml:${idx + 1}| ${RAW[f][idx].trim()}`);
      else console.log(`     ${f}.yaml: (未定位)`);
    }
    console.log();
  }
}
