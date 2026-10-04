import fs from 'fs';

const raw = fs.readFileSync('src/兽血沸腾/兽血沸腾.json', 'utf8');
const d = JSON.parse(raw);
console.log(`文件字节: ${Buffer.byteLength(raw, 'utf8').toLocaleString()}`);
console.log(`name: ${d.name}`);
console.log(`tags: ${d.tags.join('、')}`);
console.log(`avatar: ${d.avatar}`);

const data = d.data ?? {};
console.log(`\ndata 键: ${Object.keys(data).join(' / ')}`);
const cb = data.character_book;
const ents = cb?.entries ?? [];
console.log(`\n世界书条目: ${Array.isArray(ents) ? ents.length : Object.keys(ents).length}`);
const list = Array.isArray(ents) ? ents : Object.values(ents);
const pos = {};
list.forEach(e => { const p = e.extensions?.position ?? '?'; pos[p] = (pos[p] ?? 0) + 1; });
console.log(`位置分布: ${JSON.stringify(pos)}`);

console.log(`\n开场白: first_mes ${data.first_mes ? '有' : '无'} + alternate_greetings ${data.alternate_greetings?.length ?? 0} 条 = ${(data.first_mes ? 1 : 0) + (data.alternate_greetings?.length ?? 0)}`);
(data.alternate_greetings ?? []).forEach((g, i) => console.log(`   [${i + 1}] ${g.split('\n')[0].slice(0, 60)}… (${g.length} 字)`));

const th = data.extensions?.tavern_helper ?? d.extensions?.tavern_helper;
console.log(`\ntavern_helper 脚本: ${Object.keys(th?.scripts ?? {}).join(', ') || '(无)'}`);
console.log(`tavern_helper 正则: ${Object.keys(th?.regex_scripts ?? {}).length} 条`);
Object.entries(th?.regex_scripts ?? {}).forEach(([k, v]) => console.log(`   ${v.disabled ? '停用' : '启用'}  ${k}`));

console.log('\n══ 旧名残留（应全为 0，战歌名录裁定注记除外）══');
for (const t of ['斯迈禁空之歌', '斯迈禁空战歌', '琴心战歌', '地底军工基地', '香军大营', '圣弗朗西斯科', '地底军工基地', '福克森', '同指一曲', '斯迈族与禁空战歌']) {
  console.log(`  ${t.padEnd(20)} ${raw.split(t).length - 1}`);
}
