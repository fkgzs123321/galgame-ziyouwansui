import fs from 'fs';
import path from 'path';

const NPC = 'src/兽血沸腾/世界书/NPC';
const TXT = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const LINES = TXT.split('\n');
const files = fs.readdirSync(NPC).filter((f) => f.endsWith('.yaml')).sort();
const field = (txt, k) => { const m = txt.match(new RegExp('^[ \\t]*' + k + '[:：][ \\t]*(.+)$', 'm')); return m ? m[1].trim() : ''; };

// 排除「语境误报」：女神/女儿/女大公 等词里的「女」
const CLEAN = /(?:女神|女儿|女婿|才女|女大公|孙女|侄女)/g;
const bad = [];
for (const f of files) {
  const t = fs.readFileSync(path.join(NPC, f), 'utf8');
  const sex = field(t, '性别');
  const id = field(t, '身份');
  const blob = (sex + id).replace(CLEAN, '');
  if (/女|母|雌|夫人|女王|公主|主母|小姐|妇人|女子/.test(blob) && !/^(男|公|雄)/.test(sex.replace(CLEAN, ''))) bad.push({ n: f.replace('.yaml', ''), sex, id });
}
console.log(`══ 女性 NPC（清洗后）${bad.length} 人 ══`);
for (const r of bad) console.log(`  ${r.n.padEnd(14)} 性别=${(r.sex || '—').padEnd(5)} ${r.id.slice(0, 58)}`);

// 逐人在原文中查证「性别=女」的最强证据
console.log('\n\n══ 原文佐证（每人的第一句定性）══');
const PAT = /女|母|雌|妻|夫人|公主|小姐|主母/;
for (const r of bad) {
  const key = r.n.replace(/[·.].*$/, '').slice(0, 4);
  let shown = 0;
  for (let i = 0; i < LINES.length && shown < 2; i++) {
    const l = LINES[i];
    if (!l.includes(key)) continue;
    const idx = l.indexOf(key);
    const win = l.slice(Math.max(0, idx - 55), idx + 80).trim();
    if (PAT.test(win)) { console.log(`  ${r.n.padEnd(12)} L${i + 1}: ${win}`); shown++; }
  }
  if (!shown) console.log(`  ${r.n.padEnd(12)} (未找到定性句)`);
}
