// 生成「纪元分档速览」的注册补丁，并停用原来的单份 角色速览.yaml。
//
// 为什么不用一份速览：原速览把终局态身份（后为剑桥大祭师 / 后任翡冷翠魔法教官）
// 一次性喂给 AI，早期开局就会泄漏。拆成 9 份按章节区间收人的速览后，
// AI 在第 0 章只看到 2 个人，在第 245 章才看到大规模名册。
//
// 用法：node make-roster-patch.mjs   → 写 tools/patch-roster.json
// 应用：node .agents/skills/tavern-cards/scripts/tavern-cards-forge.mjs patch 兽血沸腾 --file <此文件>
import fs from 'node:fs';

const PROJ = 'src/兽血沸腾';
const { 清单 } = JSON.parse(fs.readFileSync(`${PROJ}/tools/roster-split.json`, 'utf8'));
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));

const 旧 = st.entryManifest['角色']['角色速览'];
if (!旧) { console.error('找不到 角色速览，无法参照它的 position'); process.exit(1); }

const ops = [];
清单.forEach((c, i) => {
  const 名 = `${c.档}·${c.名}速览`;
  ops.push({
    op: 'add',
    path: `/entryManifest/角色/${名}`,
    value: {
      // 速览是目录式索引，scope 用 catalog 与关键字 constant，和原速览一致。
      path: c.文件,
      scope: 'catalog',
      part: 'basic',
      keywords: [`${c.名}速览`],
      abstract: `第 ${c.lo} 至 ${c.hi} 章的登场人物名册，收录 ${c.人数} 人`,
      enabled: true,
      strategy: { type: 'constant' },
      // 门写在 contents 首片段：只有落到该章节区间才把这份名册交给 AI。
      // 上界必须有，否则第 73 章会把前六档名册全部叠着塞进去。
      contents: [
        { content: `@@if getvar('stat_data.剧情.章节序号', { defaults: 0 }) >= ${c.lo} && getvar('stat_data.剧情.章节序号', { defaults: 0 }) <= ${c.hi}` },
        { file: c.文件 },
      ],
      position: { type: 'after_character_definition', order: 1240 + i },
    },
  });
});

// 原速览停用而不是删除：它的 阵营速查 段落已抽成独立条目，见下。
ops.push({ op: 'replace', path: '/entryManifest/角色/角色速览/enabled', value: false });

// 阵营速查不属于任何单一纪元，是常设的势力归属表，单独注册且不带门。
ops.push({
  op: 'add',
  path: '/entryManifest/角色/阵营速查',
  value: {
    path: '世界书/角色/速览/阵营速查.yaml',
    scope: 'catalog',
    part: 'basic',
    keywords: ['阵营速查'],
    abstract: '各势力的代表人物归属索引',
    enabled: true,
    strategy: { type: 'constant' },
    position: { type: 'after_character_definition', order: 1249 },
  },
});

fs.writeFileSync(`${PROJ}/tools/patch-roster.json`, JSON.stringify(ops, null, 1), 'utf8');
console.log(`生成 ${ops.length} 个操作（${清单.length} 份速览 + 阵营速查 + 停用旧速览）`);
for (const c of 清单) console.log(`  ${c.档} ${c.名}  order=${1240 + 清单.indexOf(c)}  ${c.人数} 人`);
