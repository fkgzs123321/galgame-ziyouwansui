// 探针：裸前缀关键词的「撞名」实测。
//
// 旧实现 `p.split(/[.·]/)[0]` 会从 `克里斯蒂安·维埃里` 造出 `克里斯蒂安`。
// 这个词在原文里 8 行，其中 6 行是**另一个人** `克里斯蒂安.贝尔`（六翼天王）。
// 关键词命中就注入条目，所以这种裸前缀会把 A 的条目挂到 B 的楼层上。
//
// 测法：对每个裸前缀，统计它后面紧跟的 2-4 个字各是什么，
// 出现最多的那个形态就是它实际指的人。
import fs from 'fs';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 行 = 原.split('\n');
const 数行 = s => 行.filter(l => l.includes(s)).length;

// 当前 state 里所有「裸前缀」形态的关键词（不含分隔符、
// 但同一条目另有含分隔符的名字，说明它是被切出来的）
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

const 待查 = new Map(); // 裸前缀 → 所属条目集合
for (const 类型 of ['角色', 'NPC']) {
  for (const [名, leaf] of Object.entries(st.entryManifest[类型] ?? {})) {
    const 核 = 名.replace(/_(基础信息|性格调色盘|三面性|二次解释|私密档案|私密阶段)$/, '');
    const 词 = new Set([...(leaf.keywords ?? []), ...(leaf.strategy?.keys ?? [])]);
    for (const k of 词) {
      if (typeof k !== 'string' || /[.·]/.test(k)) continue;
      // 该词是不是某个含分隔符名字的前缀？
      const 是前缀 = [...词].some(o => o !== k && /[.·]/.test(o) && o.startsWith(k));
      if (是前缀) {
        if (!待查.has(k)) 待查.set(k, new Set());
        待查.get(k).add(核);
      }
    }
  }
}

console.log(`══ 裸前缀关键词 ${待查.size} 个 ══\n`);

for (const [k, 属] of [...待查].sort()) {
  const 后 = new Map();
  for (const l of 行) {
    let i = l.indexOf(k);
    while (i !== -1) {
      const tail = l.slice(i + k.length, i + k.length + 4).replace(/[\s，。！“”「」：；、（）]/g, '');
      const key = tail.slice(0, 3);
      if (key) 后.set(key, (后.get(key) || 0) + 1);
      i = l.indexOf(k, i + 1);
    }
  }
  const 排 = [...后].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const 总 = 数行(k);
  console.log(`【${k}】${总} 行   属：${[...属].join('、')}`);
  console.log(`     后续字 top5： ${排.map(([t, n]) => `「${t}」×${n}`).join('  ')}`);
}
