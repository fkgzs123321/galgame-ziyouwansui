import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function 行到idx(行) { let r = 0; for (const c of ci) { if (c.line <= 行) r = c.idx; else break; } return r; }
for (const 名 of ['凝玉', '艾薇尔', '黛丝', '若尔娜', '崔蓓茜', '海伦']) {
  for (const w of ['妻子', '夫人', '我的女人']) {
    let 首 = null, 文 = '';
    const 排 = ['凝玉', '艾薇尔', '黛丝', '若尔娜', '崔蓓茜', '海伦'];
    for (let i = 0; i < txt.length; i++) {
      const L = txt[i];
      if (!L.includes(名) || !L.includes(w)) continue;
      // 同一行不能只属于别人：粗筛掉同行出现其他候选名的情况
      const idx = 行到idx(i + 1);
      if (首 === null || idx < 首) { 首 = idx; 文 = L.trim().slice(0, 110); }
    }
    if (首 !== null) console.log(`${名} + ${w}: 首现 idx=${首}`);
  }
}
