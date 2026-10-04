// 探针：全量分隔符裁定复核。
//
// 对每个含分隔符的名字，同时数「中点形 / ASCII 点形」的原文命中，
// 谁是原文主导形态就用谁。另外数「裸前缀」（去掉后半名）的命中与歧义度。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数 = s => 原.split(s).length - 1;
const 数行 = s => 行.filter(l => l.includes(s)).length;

// 收集 state 里所有条目名 + 关键词里含分隔符的名字
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const 名字 = new Set();
for (const 类型 of ['角色', 'NPC']) {
  for (const [名, leaf] of Object.entries(st.entryManifest[类型] ?? {})) {
    const 核 = 名.replace(/_(基础信息|性格调色盘|三面性|二次解释|私密档案|私密阶段)$/, '');
    if (/[.·]/.test(核)) 名字.add(核);
    for (const k of new Set([...(leaf.keywords ?? []), ...(leaf.strategy?.keys ?? [])])) {
      if (typeof k === 'string' && /[.·]/.test(k)) 名字.add(k);
    }
  }
}

console.log('══ 分隔符形态裁定表 ══');
console.log('   名字                      中点形  ASCII点形   裸前缀(命中行/总行)   判');
console.log('   ' + '─'.repeat(92));

const 判 = [];
for (const n of [...名字].sort()) {
  const 中点 = n.replace(/[.·]/g, '·');
  const 点 = n.replace(/[.·]/g, '.');
  const n中 = 数(中点), n点 = 数(点);
  const 裸 = n.split(/[.·]/)[0];
  const 裸中 = 数(裸);
  const 裸行 = 数行(裸);
  // 裸前缀的歧义度：裸前缀出现的行里，有多少行同时含本名
  const 裸共 = 行.filter(l => l.includes(裸) && (l.includes(中点) || l.includes(点))).length;

  let 决;
  if (n中 === 0 && n点 === 0) 决 = '❌ 两形皆 0，需换名';
  else if (n中 > n点) 决 = '中点';
  else if (n点 > n中) 决 = 'ASCII点';
  else 决 = '两形相等，保持现状';

  console.log(`   ${n.padEnd(26)} ${String(n中).padStart(5)} ${String(n点).padStart(8)}   ${String(裸行).padStart(5)}/${String(裸中).padStart(4)} (共现 ${String(裸共).padStart(3)})   ${决}`);
  判.push({ n, n中, n点, 裸, 裸行, 裸共, 决 });
}

console.log('\n\n══ 裸前缀风险（裸前缀命中行数 > 本名命中行数 的，说明单写该前缀多半指别人）══');
for (const r of 判) {
  const 本名行 = 数行(r.n.replace(/[.·]/g, '·')) + 数行(r.n.replace(/[.·]/g, '.'));
  if (r.裸行 > 本名行 && r.裸 !== r.n) {
    console.log(`   ⚠ 「${r.裸}」 裸前缀 ${r.裸行} 行  vs  本名 ${本名行} 行  （本名「${r.n}」）`);
  }
}
