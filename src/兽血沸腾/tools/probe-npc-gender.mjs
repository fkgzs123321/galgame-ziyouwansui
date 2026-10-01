import fs from 'fs';
import path from 'path';

const NPC = 'src/兽血沸腾/世界书/NPC';
const files = fs.readdirSync(NPC).filter((f) => f.endsWith('.yaml')).sort();
const field = (txt, k) => { const m = txt.match(new RegExp('^[ \\t]*' + k + '[:：][ \\t]*(.+)$', 'm')); return m ? m[1].trim() : ''; };

const fem = [], male = [], unk = [];
for (const f of files) {
  const t = fs.readFileSync(path.join(NPC, f), 'utf8');
  const s = field(t, '性别') || field(t, '名称') || '';
  const sex = field(t, '性别');
  const id = field(t, '身份');
  const rec = { n: f.replace('.yaml', ''), sex, id };
  if (/女|母|雌|夫人|女王|公主|主母|小姐|妇人|女子/.test(sex + id)) fem.push(rec);
  else if (/男|公|雄|夫|亲王|陛下|王$/.test(sex + id)) male.push(rec);
  else unk.push(rec);
}
console.log(`NPC 共 ${files.length} 个文件`);
console.log(`\n══ 判为女性 ${fem.length} 人 ══`);
fem.forEach((r) => console.log(`  ${r.n.padEnd(14)} 性别=${(r.sex || '—').padEnd(6)} ${r.id.slice(0, 52)}`));
console.log(`\n══ 判为男性 ${male.length} 人 ══`);
console.log('  ' + male.map((r) => r.n).join('、'));
console.log(`\n══ 无法判定 ${unk.length} 人 ══`);
unk.forEach((r) => console.log(`  ${r.n.padEnd(14)} 性别=${(r.sex || '—').padEnd(6)} ${r.id.slice(0, 52)}`));
