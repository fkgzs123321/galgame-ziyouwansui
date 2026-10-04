import fs from 'fs';

const raw = fs.readFileSync('src/兽血沸腾/兽血沸腾.json', 'utf8');
const card = JSON.parse(raw);
const d = card.data;

const cnt = t => raw.split(t).length - 1;
console.log('══ 成品中的人名计数 ══');
for (const t of ['艾薇尔', '艾薇儿', '艾薇尔铁塔']) console.log(`  ${t}: ${cnt(t)}`);

// 故事大纲引文里的原文异写不该进成品
console.log('\n══ 世界书中「艾薇儿」出现处（应仅限逐字台词，若有）══');
let n = 0;
for (const e of d.character_book.entries) {
  const c = e.content ?? '';
  if (c.includes('艾薇儿')) {
    c.split('\n').forEach((l, i) => {
      if (l.includes('艾薇儿')) { n++; if (n <= 10) console.log(`  ${e.comment}: …${l.trim().slice(0, 130)}`); }
    });
  }
}
console.log(`  合计 ${n} 处`);

console.log('\n══ 角色条目名 ══');
d.character_book.entries.filter(e => /艾薇/.test(e.comment ?? '')).forEach(e => console.log(`  ${e.comment}`));

console.log('\n══ 开场白中的计数 ══');
const fm = (d.first_mes ?? '') + (d.alternate_greetings ?? []).join('');
console.log(`  艾薇尔: ${fm.split('艾薇尔').length - 1}   艾薇儿: ${fm.split('艾薇儿').length - 1}`);

console.log('\n══ 结构复核 ══');
console.log(`  世界书条目: ${d.character_book.entries.length}`);
console.log(`  开场白: 1 + ${d.alternate_greetings.length}`);
console.log(`  scripts: ${d.extensions.tavern_helper.scripts.map(s => s.name).join(', ')}`);
console.log(`  regex: ${d.extensions.regex_scripts.length}`);
