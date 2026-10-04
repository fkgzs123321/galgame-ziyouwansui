// 修三个缺陷：① 核心特质被硬截断在词中 ② 空字段 ③ 少数条目缺参考语料
import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');

const BAN = [/——/, /似乎|几乎|仿佛|如同|宛如|好似|犹如/, /涟漪|嘴角微微上扬|眼中闪过一丝/,
  /心头一震|心中一凛|不由自主地|不禁/, /不是[^，。]{1,20}，而是/, /待补|TODO|FIXME/];
const bad = s => BAN.some(r => r.test(s));
const clean = s => s.trim().replace(/\s+/g, '');
const ok = q => q.length >= 5 && q.length <= 95 && /[\u4e00-\u9fa5]{3}/.test(q) && !bad(q);

// 取完整短语，绝不截断在词中
const LEAD = /^(在|用|把|将|拿|与|和|替|被|对|跟|从|为|给|一|有|是|会|爱|常|总|先|又|也|还|就)/;
function keyword(c) {
  const x = c.replace(LEAD, '');
  const seg = x.split(/[，,、；;：]/)[0];
  if (seg.length <= 16) return seg;
  const m = seg.match(/^(.{6,16}?)(?=[让使把将用拿与和为对向从跟随]|起身|出手|开口|抬头|伸手|抽|挥|转身|掉头|带|领|排|架|举)/);
  return m ? m[1] : seg.slice(0, 16);
}

function fillQuotes(name, kw) {
  const vars = [...new Set([name, ...kw, name.replace(/[.·]/g, '')])].filter(v => v.length >= 2);
  const out = []; const seen = new Set();
  const push = q => { const c = clean(q); if (!ok(c) || seen.has(c)) return; seen.add(c); out.push(c); };
  const V = vars.join('|');
  const reA = new RegExp(`[“"]([^”"]{5,90})[”"][^“”"]{0,20}(?:${V})`, 'g');
  const reB = new RegExp(`(?:${V})[^“”"]{0,20}(?:说道|笑道|喊道|问道|答道|怒道|道|说|叫|哼|叹|冷笑|开口)[：:]?\\s*[“"]([^”"]{5,90})[”"]`, 'g');
  for (let i = 0; i < lines.length; i++) {
    if (!vars.some(v => lines[i].includes(v))) continue;
    const seg = [lines[i - 1] ?? '', lines[i], lines[i + 1] ?? ''].join('');
    for (const m of seg.matchAll(reA)) push(m[1]);
    for (const m of seg.matchAll(new RegExp(reB.source, 'g'))) push(m[1]);
    if (out.length >= 10) break;
  }
  if (out.length < 5) for (const l of lines) {
    if (!vars.some(v => l.includes(v))) continue;
    for (const m of l.matchAll(/[“"]([^”"]{5,90})[”"]/g)) push(m[1]);
    if (out.length >= 10) break;
  }
  return out.slice(0, 10);
}

const NEED = ['依莎贝拉', '冰肌仙子', '含香仙子', '杰拉德', '米娅', '凌波仙子', '罗浮仙子', '迦莎', '小净',
  '宫保仙师', '古川', '巴克蒂亚萨德赫', '希丁克', '托蒂·夏尔巴', '托马西·丹泽', '加图索·丹泽',
  '瑞卡雅顿布', '拉莫斯', '死神印记', '波利斯', '穆托姆博', '米库', '克虏伯', '卡提比', '勃郎宁',
  '华金', '海德殿下', '巢农主母', '齐丹大萨满', '口水怪'];

let kFixed = 0, rFixed = 0, qFixed = 0; const qLog = [];
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml'))) {
  const p = path.join(NPC, f);
  let t = fs.readFileSync(p, 'utf8');
  const n = f.replace('.yaml', '');

  // ① 只重算「行为模式」下的句首，用于核心特质
  const bm = t.match(/^  行为模式:\n((?:    - .*\n?)*)/m);
  if (bm) {
    const beh = [...bm[1].matchAll(/^    - (.*)$/gm)].map(m => m[1].replace(/^"|"$/g, ''));
    if (beh.length) {
      const nt = beh.slice(0, 3).map(keyword).filter(Boolean).join('、');
      const b4 = t;
      t = t.replace(/^  核心特质: .*$/m, `  核心特质: ${nt}`);
      if (t !== b4) kFixed++;
    }
  }

  // ② 空字段宁删不空
  for (const k of ['互动方式', '态度', '关键特征', '整体印象', '关系', '说话风格']) {
    if (new RegExp(`^  ${k}: ""\\s*$`, 'm').test(t)) {
      t = t.replace(new RegExp(`^  ${k}: ""\\n?`, 'm'), '');
      rFixed++;
    }
  }

  // ③ 补语料（仅针对参考语料块内的条数）
  if (NEED.includes(n)) {
    const m = t.match(/^  参考语料:\n((?:    - .*\n?)*)/m);
    const have = m ? [...m[1].matchAll(/^    - (.*)$/gm)].map(x => x[1].replace(/^"|"$/g, '')) : [];
    if (have.length < 5) {
      const add = fillQuotes(n, [n]).filter(q => !have.includes(q));
      if (add.length) {
        const all = [...have, ...add].slice(0, 10);
        const block = `  参考语料:\n` + all.map(q => `    - ${JSON.stringify(q)}`).join('\n') + '\n';
        if (m) t = t.replace(/^  参考语料:\n(?:    - .*\n?)*/m, block);
        else t = t.replace(/\n*$/, '\n' + block);
        qLog.push(`${n}: ${have.length} → ${all.length}`);
        qFixed++;
      }
    }
  }
  fs.writeFileSync(p, t, 'utf8');
}
console.log(`核心特质重算 ${kFixed}；空字段清除 ${rFixed}；补语料 ${qFixed}`);
qLog.forEach(s => console.log('  ' + s));
