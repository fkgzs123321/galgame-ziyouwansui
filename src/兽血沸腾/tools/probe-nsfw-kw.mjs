import fs from 'fs';

const s = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const ROSTER = ['凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝', '贞德', '白素青', '谭雅', '珊瑚美人', '阿仙奴', '安瑞达', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕'];

console.log('════ 各角色已有条目的 keywords（用于挑选第二个关键词）════');
for (const r of ROSTER) {
  const own = Object.entries(s.entryManifest['角色']).filter(([n]) => n.startsWith(r));
  console.log(`\n【${r}】`);
  for (const [n, v] of own) {
    console.log(`  ${n.padEnd(22)} part=${String(v.part).padEnd(12)} scope=${String(v.scope).padEnd(9)} kw=${JSON.stringify(v.keywords)}`);
  }
  if (!own.length) console.log('  (无)');
}

console.log('\n════ 各角色目录下已有的 yaml 文件 ════');
for (const r of ROSTER) {
  const d = `src/兽血沸腾/世界书/角色/${r}`;
  if (!fs.existsSync(d)) { console.log(`  ${r}: 目录不存在`); continue; }
  const files = fs.readdirSync(d);
  const missing = ['私密.yaml', '私密阶段.yaml'].filter(f => !files.includes(f));
  console.log(`  ${r.padEnd(8)} ${files.length} 文件  缺: ${missing.length ? missing.join('、') : '无'}`);
}
