// 合并重复角色：谭雅 ≡ 珊瑚美人（原文同一人）。
// 证据：L57600「他还给这尊珊瑚美人起了个很好听的名字……谭雅」、L102090「这是珊瑚美人谭雅」、
//       L126130 同场并列；全篇 11 处两名字同句，全部是同位语。
// 裁定：MVU 运行期（开场白/initvar/6.yaml 关系键、后宫.成员、子嗣.母亲×2）一律用「谭雅」，
//       故以 谭雅 为条目名与目录名，珊瑚美人 降为关键词别名。
// 发色以原文 L37534「它的头发是黑色的」为准（旧 谭雅 稿写「栗色」为误）。
// 只做状态层改动；已把两个正文文件合并写入 世界书/角色/谭雅/。
import fs from 'fs';
import { execFileSync } from 'child_process';

const PROJ = 'src/兽血沸腾';
const STATE = `${PROJ}/tavern-cards-state.json`;
const DRY = process.argv.includes('--dry');

const s0 = JSON.parse(fs.readFileSync(STATE, 'utf8'));
const 角色 = s0.entryManifest['角色'];
const ops = [];
const log = [];

// ── 1. 删除 珊瑚美人 名下的三条条目（存在才删；不存在的 remove 会让整个补丁抛错）
for (const name of ['珊瑚美人_基础信息', '珊瑚美人_私密档案', '珊瑚美人_私密阶段']) {
  if (角色[name]) {
    ops.push({ op: 'remove', path: `/entryManifest/角色/${name}` });
    log.push(`  ✗ 删除 ${name}`);
  } else {
    log.push(`  · ${name} 不存在，跳过`);
  }
}

// ── 2. 谭雅 三条条目：基础信息（并入别称关键词）+ 私密档案 + 私密阶段
const KW = ['谭雅', '珊瑚美人'];

ops.push({
  op: 'add',
  path: '/entryManifest/角色/谭雅_基础信息',
  value: {
    scope: 'specific',
    part: 'basic',
    keywords: KW,
    abstract: '谭雅（珊瑚美人）的基础信息：水晶人起源、石化长生、进贡与命名、财神玉盂与镜面搜索引擎、宇宙来历的推断',
    path: '世界书/角色/谭雅/基础信息.yaml',
  },
});
log.push('  ✓ 重写 谭雅_基础信息  kw=' + JSON.stringify(KW));

ops.push({
  op: 'add',
  path: '/entryManifest/角色/谭雅_私密档案',
  value: {
    scope: 'specific',
    part: 'other',
    keywords: KW,
    abstract: '谭雅（珊瑚美人）的私密档案：胶体珊瑚形体、外观逐部位、气味、分泌物、敏感带、名器卧绵藏潮、性癖',
    contents: [
      { content: '---\n<character_other character="谭雅">' },
      { file: '世界书/角色/谭雅/私密.yaml' },
      { content: '</character_other>' },
    ],
  },
});
log.push('  ✓ 新建 谭雅_私密档案  XML/contents');

ops.push({
  op: 'add',
  path: '/entryManifest/角色/谭雅_私密阶段',
  value: {
    scope: 'specific',
    part: 'other',
    keywords: KW,
    abstract: '谭雅（珊瑚美人）的私密阶段：库房藏品 / 认下她是活的 / 定了型当家的老板娘，按章节序号分档',
    path: '世界书/角色/谭雅/私密阶段.yaml',
  },
});
log.push('  ✓ 新建 谭雅_私密阶段  EJS/path');

console.log('════ 合并计划 ════');
log.forEach(l => console.log(l));
console.log(`\n共 ${ops.length} 个操作`);

if (DRY) {
  console.log('\n(--dry：未写入)');
  process.exit(0);
}

fs.writeFileSync(`${PROJ}/tools/patch-merge-tanya.json`, JSON.stringify(ops, null, 2), 'utf8');
const out = execFileSync(
  'node',
  ['.skills/tavern-cards/tavern-cards/scripts/tavern-cards-forge.mjs', 'patch', '兽血沸腾', '--file', `${PROJ}/tools/patch-merge-tanya.json`],
  { encoding: 'utf8' },
);
console.log(out.trim());

const s = JSON.parse(fs.readFileSync(STATE, 'utf8'));
const dist = {};
for (const v of Object.values(s.entryManifest['角色'])) {
  const p = v.part || '(none)';
  dist[p] = (dist[p] || 0) + 1;
}
console.log('\n角色 part 分布:', dist);
console.log('角色条目总数:', Object.keys(s.entryManifest['角色']).length);
const left = Object.keys(s.entryManifest['角色']).filter(n => /珊瑚/.test(n));
console.log('残留「珊瑚」条目:', left.length ? left.join(', ') : '（无）');
