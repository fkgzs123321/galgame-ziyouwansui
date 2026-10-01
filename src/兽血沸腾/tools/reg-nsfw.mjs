// 批量为 16 名成年女性角色注册 私密档案（XML 静态）+ 私密阶段（@@private EJS）两个条目。
// 用法：node src/兽血沸腾/tools/reg-nsfw.mjs [--dry]
// 只注册磁盘上确实存在对应 yaml 文件的角色，因此可反复运行、增量补齐。
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const PROJ = 'src/兽血沸腾';
const STATE = `${PROJ}/tavern-cards-state.json`;
const DRY = process.argv.includes('--dry');

// 角色 → 第二关键词（第一关键词恒为角色名本身）。
// 依据 probe-nsfw-kw.mjs 查到的既有条目关键词，选取该角色最贴切、且其他角色不用的别名。
// 安瑞达已从名册剔除：她的形体在原文与本卡基础信息里都是幼女
// （基础信息.yaml L10「平日的身体是一个小女孩」/ L16「幼女的身体」；
//   原文 L76646「躺在箱子里的小女孩」、L101402「配上一个幼女的身体」），
// 与名册「成年女性」前提和世界书/扮演准则/NSFW准则.yaml L64「不写未成年角色的露骨性描写」冲突。
// 排除性检索：全篇 252 处「安瑞达」与 酥胸|乳房|翘臀|长腿|身段|曲线|丰满 共现 0 次，
// 原文从未呈现成年形态，返老还童（L78906）也不构成可用的成年实体。
// 珊瑚美人已与谭雅合并为一个角色：原文 L57600「他还给这尊珊瑚美人起了个很好听的名字……谭雅」、
// L102090「这是珊瑚美人谭雅」、L126130 同场并列，全篇 11 处两名字同句全部是同位语。
// 目录与条目名统一用「谭雅」（MVU 运行期的关系键、后宫.成员、子嗣.母亲均为「谭雅」），
// 「珊瑚美人」退为第二关键词，说全了是「珊瑚美人谭雅」。旧「谭雅.玛索」为臆造，不得复活。
// ⚠️ 谭雅目录下的 基础信息.yaml 也需注册，但本脚本只管私密两个条目，基础信息由创作规划那边维护。
const ROSTER = [
  ['凝玉', '蚌女'],
  ['艾薇尔', '美人鱼公主'],
  ['崔蓓茜', '美杜莎'],
  ['歌坦妮', '天鹅女骑士'],
  ['若尔娜', '仙女龙'],
  ['黛丝', '龙族'],
  ['贞德', '圣女贞德'],
  ['白素青', '青玉灵蟒'],
  ['谭雅', '珊瑚美人'],
  ['阿仙奴', '仙女龙'],
  ['许德拉', '九头蛇怪'],
  ['歌莉妮', '莉莉'],
  ['唐蓓尔金娜', '冰凰'],
  // `宝莱坞公证殿下` 是原文「宝莱坞大陆的梦露公证殿下」被从句中间切断的产物，全篇 0 命中。
  // 原文只写 `玛丽莲`(2) / `梦露陛下`(28) / `梦露女王`(51) / `梦露公证殿下`(1)。
  ['梦露', '梦露女王'],
  ['嘉宝', '巫妖女王'],
  ['艾莉婕', '花中皇后'],
];

const s0 = JSON.parse(fs.readFileSync(STATE, 'utf8'));
const ops = [];
const report = [];

for (const [name, alias] of ROSTER) {
  const dir = path.join(PROJ, '世界书/角色', name);
  const fA = path.join(dir, '私密.yaml');
  const fB = path.join(dir, '私密阶段.yaml');
  const hasA = fs.existsSync(fA);
  const hasB = fs.existsSync(fB);
  if (!hasA && !hasB) { report.push(`  ${name.padEnd(8)} ✗ 两个文件都还没有，跳过`); continue; }

  // 第二关键词不能与角色名重复（否则关键词退化成一个）
  const kws = alias && alias !== name ? [name, alias] : [name];

  for (const [suffix, file, isXml] of [['私密档案', fA, true], ['私密阶段', fB, false]]) {
    if (!(suffix === '私密档案' ? hasA : hasB)) { report.push(`  ${name.padEnd(8)} ${suffix} 缺文件，跳过`); continue; }
    const entryName = `${name}_${suffix}`;
    const rel = `世界书/角色/${name}/${suffix === '私密档案' ? '私密.yaml' : '私密阶段.yaml'}`;

    // 已有同名的先删掉，避免 contents/path 两种形态互相残留
    if (s0.entryManifest?.['角色']?.[entryName]) {
      ops.push({ op: 'remove', path: `/entryManifest/角色/${entryName}` });
    }

    const body = fs.readFileSync(file, 'utf8');
    const lines = body.split('\n');
    const title = (lines.find(l => /^[^\s#<@%][^:]*:/.test(l)) || '').split(':')[0] || entryName;

    // 架构防线：XML 包裹的条目正文里绝不能有 @@ 装饰器；
    // 纯 path 的 EJS 条目第一行必须是 @@private。
    if (isXml) {
      const bad = lines.findIndex(l => l.trimStart().startsWith('@@'));
      if (bad >= 0) throw new Error(`${name}/${suffix}: 第 ${bad + 1} 行出现 @@ 装饰器，但该条目以 XML 包裹注册，装饰器会被挤到 XML 开标签之后`);
    } else {
      if (lines[0].trim() !== '@@private') throw new Error(`${name}/${suffix}: 第 1 行必须是 @@private，实际是「${lines[0].slice(0, 40)}」`);
      if (/<(character_|region)/.test(body)) throw new Error(`${name}/${suffix}: EJS 条目里出现 XML 标签`);
    }

    const sizeA = Buffer.byteLength(body, 'utf8');
    const value = isXml
      ? {
          scope: 'specific',
          part: 'other',
          keywords: kws,
          abstract: `${name}的私密档案：${title}。外观逐部位、气味、分泌物、敏感带、名器、性癖`,
          contents: [
            { content: `---\n<character_other character="${name}">` },
            { file: rel },
            { content: '</character_other>' },
          ],
        }
      : {
          scope: 'specific',
          part: 'other',
          keywords: kws,
          abstract: `${name}的私密阶段：随剧情轴递进的分档表现`,
          path: rel,
        };

    ops.push({ op: 'add', path: `/entryManifest/角色/${entryName}`, value });
    report.push(`  ${name.padEnd(8)} ✓ ${entryName.padEnd(16)} ${sizeA}B  kw=${JSON.stringify(kws)}  ${isXml ? 'XML/contents' : 'EJS/path'}`);
  }
}

console.log('════ 注册计划 ════');
report.forEach(r => console.log(r));
console.log(`\n共 ${ops.length} 个操作`);

if (DRY) { console.log('\n(--dry：未写入)'); process.exit(0); }
if (!ops.length) { console.log('无操作，退出'); process.exit(0); }

fs.writeFileSync(`${PROJ}/tools/patch-nsfw.json`, JSON.stringify(ops, null, 2), 'utf8');
const out = execFileSync('node', ['.skills/tavern-cards/tavern-cards/scripts/tavern-cards-forge.mjs', 'patch', '兽血沸腾', '--file', `${PROJ}/tools/patch-nsfw.json`], { encoding: 'utf8' });
console.log(out.trim());

const s = JSON.parse(fs.readFileSync(STATE, 'utf8'));
const dist = {};
for (const v of Object.values(s.entryManifest['角色'])) { const p = v.part || '(none)'; dist[p] = (dist[p] || 0) + 1; }
console.log('\n角色 part 分布:', dist);
console.log('角色条目总数:', Object.keys(s.entryManifest['角色']).length);
