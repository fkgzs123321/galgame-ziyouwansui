// 生成 NPC 注册补丁（终版）
// 1) 删掉 20 个群像旧条目（用户裁定：按 skill 拆成独立文件）
// 2) 注册 113 个独立 NPC 文件
// 3) 注册新增的 世界观/召唤物与领域.yaml（接收死神印记、口水怪两个非人物条目）
//
// 关键词策略：NPC 是「按人名检索」的功能性条目，关键词 = 本人名 + 别名 + 原文异写。
// 不继承原群像的派系宽泛词（魔族、海族、龙族…），因为那会让一次提及同时拉起十几个文件，
// 而派系级检索已由 世界观／地理／时间线 的专门条目承载（已用 audit-groupword-coverage.mjs 核实）。
import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
const ST = 'src/兽血沸腾/tavern-cards-state.json';
const st = JSON.parse(fs.readFileSync(ST, 'utf8'));

const files = fs.readdirSync(NPC).filter(f => f.endsWith('.yaml')).sort();

// 别名表：文件名 → 额外可检索词（原文异写、别称、旧文件名）
// 纪律（见 术语纪律.md「关键词 / 别名必须是原文真有的字串」）：
//   这里的每个词都必须逐字在 兽血沸腾.txt 里命中 ≥1 次，且分隔符照原文抄。
const ALIAS = {
  '四殿下': ['唐藏亲王', '唐藏四殿下', '玄奥的壮汉殿下'],
  '阿杜': ['麝人阿杜', '迪尔族麝头人'],
  '古德': ['潘帅', '潘塔族熊猫武士'],
  // `寇涛人鱼王` 0 命中；原文写的是「寇涛人鱼」(128 次)。
  '寇涛': ['寇涛人鱼'],
  // `布拉特红衣大祭司` 0 命中；原文 L24794 写「红衣大祭司布拉特」(32 次)。
  '布拉特': ['红衣大祭司布拉特'],
  // 卡佩罗/卡萨诺的「.夏尔巴」「·夏尔巴」两种写法全篇均 0 命中，
  // 夏尔巴只是家族名（`夏尔巴商团`/`托蒂·夏尔巴`），不是本人的别名，故不再挂。
  '卡佩罗': [],
  '卡萨诺': [],
  // 原文写的是中点形「米娅·哈姆」（L45750，全篇 1 次），ASCII 点形 0 命中
  '米娅': ['米娅·哈姆'],
  // 保罗·马尔蒂尼：原始条目名曾写 ASCII 点形，原文只有中点形（5:0），已正名为中点。
  // `保罗二世` 是他的教宗名号（原文 26 次，故事大纲 L6937 明写「保罗·马尔蒂尼（保罗二世）」）。
  // **裸 `保罗` 不收**：原文 237 行里 105 行是另一个 NPC「保罗纽曼」、86 行是「圣保罗教」，
  // 只有 9 行指他本人。挂上去会把别人的楼层拉进他的条目。
  '保罗·马尔蒂尼': ['马尔蒂尼', '保罗二世'],
  '乔治.贝斯特': ['贝斯特'],
  // 维埃里：原文自行介绍的形态是 ASCII 点形「克里斯蒂安.维埃里」（2 次），
  // 中点形 0 次。`维黑子` 是他的绰号（28 次）。
  // **裸 `克里斯蒂安` 不收**：原文 6 行里 4 行是另一个人「克里斯蒂安·贝尔」（六翼天王）。
  '维埃里': ['维黑子'],
  // `依莎贝拉·列娜`/`依莎贝拉.列娜` 均 0 命中（`列娜` 9 次里 8 次属海伦.列娜）
  '依莎贝拉': [],
  // `奥尼尔，全名沙奎尔` 这类整句 0 命中；真实可用的是下面两个短形。
  '奥尼尔': ['沙奎尔', '奥胖'],
  // `贝克汉姆，全名大卫` 0 命中；`大卫` 会与凝玉的碧玉龙大卫撞名，不挂。
  '贝克汉姆': ['大卫·贝克汉姆', '小贝', '万人迷'],
  // `贝肯鲍尔，全名贝肯鲍尔` 是自指整句；`贝肯鲍尔.波赛东` 0 命中。
  '贝肯鲍尔': ['波赛东'],
  '菲高': ['路易斯.菲利浦.菲高'],
  // 下面这几个后缀词在 13.6 MB 原文里命中 0 次，是臆造，已清退：
  //   费雯丽.李 / 赫莲娜.索菲亚 / 幽月儿.索菲亚 / 巢农.索菲亚 / 明姚.索菲亚
  // （`索菲亚` 这个词整本小说一次都没出现过。）不要加回来。
  '幽月儿': ['幽月儿·杜垩登'],
  // 梦露：`宝莱坞公证殿下` 是把 L89984「宝莱坞大陆的梦露公证殿下」从中间切断的
  // 拼接词，0 命中；真实的短形见下。
  '梦露': ['玛丽莲', '梦露陛下', '梦露女王'],
  '普斯卡什': ['普斯卡什大师'],
};

// 硬性排除的过泛词（即便出现在别名表也丢掉）
const TOO_GENERIC = new Set(['马', '王', '主', '大人', '女士', '先生', '大卫', '路易斯']);

// `姓名:` 行常见写法：
//   古德                                    → 本名
//   奥尼尔，全名沙奎尔·奥尼尔，绰号奥胖      → 本名 + 全名 + 绰号
//   卡佩罗，又称卡佩罗.夏尔巴                → 本名 + 又称
//   四殿下，通称玄奥的壮汉殿下               → 本名 + 通称
//   梦露（`全名:` 另起一行）                 → 本名
// 旧实现把整行当关键词，于是「奥尼尔，全名沙奎尔」这种半句被写进 keywords。
// 现在按字段名切分，只取**名字本身**。
function namesFrom(nm) {
  const out = [];
  // 先按「，」切成字段，每段形如 `全名沙奎尔·奥尼尔` / `绰号奥胖` / `又称卡佩罗.夏尔巴`
  for (const seg of nm.split(/[，,]/).map(s => s.trim()).filter(Boolean)) {
    const m = seg.match(/^(?:全名|通称|又称|又写作|绰号|别名|小名)(.+)$/);
    const val = m ? m[1].trim() : seg;
    // 名字本身可能是并列的（`绰号小贝、万人迷`），但并列词已由 ALIAS 逐个核验，故只取第一段
    for (const p of val.split(/[、]/).map(s => s.trim()).filter(Boolean)) {
      if (p.length >= 2 && p.length <= 14) out.push(p);
      // 去掉尾随的说明性小句（`玛丽莲，下属称她梦露陛下` → `玛丽莲`）
      const head = p.split(/，/)[0].trim();
      if (head !== p && head.length >= 2 && head.length <= 14) out.push(head);
    }
  }
  return out;
}

// 逐词核验：原文 0 命中的一律不收（纪律见 术语纪律.md）
const 经文 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 原文有 = k => 经文.includes(k);

function meta(n) {
  const t = fs.readFileSync(path.join(NPC, n + '.yaml'), 'utf8');
  const g = k => (t.match(new RegExp(`^  ${k}: (.*)$`, 'm')) || [, ''])[1].trim();
  const nm = g('姓名'), fn = g('全名'), id = g('身份');
  const keys = new Set([n]);
  // 条目的**本名**永远保留，哪怕原文没这么连写过（它是文件身份，不是检索别名）
  for (const k of [...namesFrom(nm), ...namesFrom(fn)]) keys.add(k);
  (ALIAS[n] || []).forEach(k => keys.add(k));
  const kw = [...keys]
    .filter(k => k.length >= 2 && k.length <= 14 && !TOO_GENERIC.has(k))
    // 非本名的候选词必须原文真有
    .filter(k => k === n || 原文有(k))
    .sort();
  const abs = (id.split(/[，,]/)[0] || '').slice(0, 34) || n;
  return { kw, abs };
}

const ops = [];
const removed = Object.keys(st.entryManifest.NPC || {});
for (const g of removed) ops.push({ op: 'remove', path: `/entryManifest/NPC/${g}` });

for (const f of files) {
  const n = f.replace(/\.yaml$/, '');
  const { kw, abs } = meta(n);
  ops.push({
    op: 'add', path: `/entryManifest/NPC/${n}`,
    value: {
      path: `世界书/NPC/${f}`, scope: 'specific', keywords: kw, abstract: abs,
      enabled: true,
      strategy: { type: 'selective', keys: kw },
      position: { type: 'after_character_definition', order: 1440 },
    },
  });
}

// 新增世界观条目：召唤物与领域
const SUMMON = '召唤物与领域';
if (!st.entryManifest.世界观?.[SUMMON]) {
  ops.push({
    op: 'add', path: `/entryManifest/世界观/${SUMMON}`,
    value: {
      path: '世界书/世界观/召唤物与领域.yaml', scope: 'specific',
      keywords: ['死神印记', '口水怪', '召唤物', '海尔静音禁锢领域'],
      abstract: '会战中按契约召唤的非人战力：死神印记与口水怪',
      enabled: true, strategy: { type: 'selective', keys: ['死神印记', '口水怪', '召唤物', '海尔静音禁锢领域'] },
      position: { type: 'before_character_definition', order: 0 },
    },
  });
}

fs.writeFileSync('src/兽血沸腾/tools/patch-npc.json', JSON.stringify(ops, null, 2), 'utf8');
console.log(`remove ${removed.length}；add NPC ${files.length}；add 世界观 1`);
console.log(`关键词为空: ${files.filter(f => meta(f.replace(/\.yaml$/, '')).kw.length === 0).length}`);
const seen = new Map(), dup = [];
for (const f of files) {
  const n = f.replace(/\.yaml$/, '');
  for (const k of meta(n).kw) { if (seen.has(k)) dup.push(`${k}: ${seen.get(k)} ↔ ${n}`); else seen.set(k, n); }
}
console.log(`NPC 之间关键词冲突: ${dup.length}`);
dup.forEach(d => console.log('  ' + d));
