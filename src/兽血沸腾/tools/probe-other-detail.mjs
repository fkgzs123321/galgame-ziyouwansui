import fs from 'fs';
import path from 'path';

for (const proj of ['旮旯给木-伏魔记', '怨妇救赎', '不要玩弄我的鸡吧-forge']) {
  const st = JSON.parse(fs.readFileSync(`src/${proj}/tavern-cards-state.json`, 'utf8'));
  console.log(`\n${'═'.repeat(78)}\n══ ${proj} ══`);
  console.log('strategyThresholds.角色 =', JSON.stringify(st.strategyThresholds?.['角色']));
  console.log('partOrder.角色 =', JSON.stringify(st.partOrder?.['角色']));

  const others = Object.entries(st.entryManifest['角色'] || {}).filter(([, l]) => l.part === 'other');
  const withXml = others.filter(([, l]) => (l.contents || []).some(x => typeof x.content === 'string' && x.content.includes('<character')));
  const withEjs = others.filter(([, l]) => (l.contents?.[0]?.content || '').startsWith('@@'));
  console.log(`other 条目 ${others.length}；带 XML ${withXml.length}；注册层带 EJS ${withEjs.length}`);
  const pick = withXml.find(([, l]) => (l.contents[0].content || '').startsWith('@@')) || withXml[0];
  if (pick) {
    console.log(`\n── 样例 leaf: ${pick[0]} ──`);
    console.log(JSON.stringify(pick[1], null, 2));
    const f = pick[1].contents.find(x => x.file)?.file;
    console.log(`── 内容文件 ${f} 前 12 行 ──`);
    try {
      console.log(fs.readFileSync(path.join('src', proj, f), 'utf8').split('\n').slice(0, 12).map((l, i) => `${i + 1}| ${l}`).join('\n'));
    } catch (e) { console.log('  (读不到)', e.message); }
  }
}
