import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
const sus = [];
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml'))) {
  const t = fs.readFileSync(path.join(NPC, f), 'utf8');
  const n = f.replace('.yaml', '');
  const qs = [...t.matchAll(/^    - (".*")$/gm)].map(m => { try { return JSON.parse(m[1]); } catch { return m[1]; } });
  for (const q of qs) {
    const reasons = [];
    if (q.length < 8) reasons.push('过短');
    if (!/[。！？…”"]$/.test(q)) reasons.push('无句末标点');
    if (!/[\u4e00-\u9fa5]/.test(q)) reasons.push('无中文');
    // 像专有名词/技能名而非话：无标点且 <14 字
    if (!/[，。！？；：、]/.test(q) && q.length < 14) reasons.push('像名词');
    if (/^(海尔|布鲁斯柯|领域|战歌|光环)/.test(q)) reasons.push('像技能名');
    if (reasons.length >= 2) sus.push(`${n}: 「${q}」 ← ${reasons.join('/')}`);
  }
}
console.log(`══ 可疑语料 (${sus.length}) ══`);
sus.forEach(s => console.log('  ' + s));
