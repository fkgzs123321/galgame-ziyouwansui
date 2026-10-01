// 为「女性角色补全」生成 forge 注册补丁。
//
// A 组：8 位女性 NPC 升格为「角色」——删 NPC 条目与文件，注册：
//       基础信息 + 性格调色盘 + 私密档案 + 私密阶段
//       （另 9 位素材仅 1-4 行，不够角色级，维持 NPC）
// B/C 组：4 位已有基础信息的女性角色，补注册 性格调色盘
//       其中 安瑞达 按成年女性处理，另注册 私密档案 + 私密阶段
//
// 注意：position.order 只是占位，forge configure 会按 entryManifest 的插入顺序重排。
import fs from 'fs';
import path from 'path';

const ST = 'src/兽血沸腾/tavern-cards-state.json';
const NPC = 'src/兽血沸腾/世界书/NPC';
const ROLE = 'src/兽血沸腾/世界书/角色';
const st = JSON.parse(fs.readFileSync(ST, 'utf8'));

// —— A 组：升格名单（素材 11 行以上，够角色级）——
const 升格 = ['幽月儿', '加茜娅', '伦娜', '费雯丽', '朝河兰', '珍妮佛', '波姬小丝', '赫莲娜'];

// —— B/C 组：补性格调色盘 ——
const 补调色盘 = ['喀秋莎', '茜茜', '姬丝凯碧', '安瑞达'];

// —— 补私密档案 + 私密阶段的名单 ——
// A 组 8 人 + 安瑞达（一万余岁，按成年女性处理；详见 术语纪律.md 形体裁定）。
// 喀秋莎／茜茜／姬丝凯碧 不在其中：绝不写私密。
const 补私密 = [...升格, '安瑞达'];

// 别名表：**只收原文真实出现过的写法**。
// 早前这里写过 赫莲娜.索菲亚 / 幽月儿.索菲亚 / 费雯丽.李 / 米娅.哈姆，
// 经全文检索均为 0 命中（`索菲亚` 这个词整本小说一次都没出现过），是臆造的，
// 已删除 —— 关键词是运行时检索入口，写错等于凭空多出一个查不到的词。
const ALIAS = {
  幽月儿: ['幽月儿·杜垩登'],
};

// 与现有 角色 条目里 basic 的 order 对齐：1255/1256 是 凝玉，各角色按序递增。
// 直接沿用「after_character_definition + 1255/1256」即可，forge configure 会重排。
const ORDER_BASIC = 1255;
const ORDER_PERS = 1256;
const ORDER_NSFW = 1257;
const ORDER_TIER = 1258;

function 关键词(名) {
  const keys = new Set([名]);
  const head = 名.split(/[.·]/)[0];
  if (head.length >= 2 && head !== 名) keys.add(head);
  (ALIAS[名] || []).forEach(k => keys.add(k));
  return [...keys].filter(k => k.length >= 2 && k.length <= 14).sort();
}

function 摘要(名) {
  // 从新写的 基础信息.yaml 里取「身份」首段
  const p = path.join(ROLE, 名, '基础信息.yaml');
  const t = fs.readFileSync(p, 'utf8');
  const m = t.match(/^\s*身份[:：]\s*(.+)$/m);
  return m ? m[1].split(/[，,]/)[0].slice(0, 34) : 名;
}

function 基础信息条目(名) {
  const kw = 关键词(名);
  return {
    part: 'basic',
    scope: 'specific',
    keywords: kw,
    abstract: 摘要(名),
    contents: [
      { content: `---\n<character_basic character="${名}">` },
      { file: `世界书/角色/${名}/基础信息.yaml` },
      { content: '</character_basic>' },
    ],
    enabled: true,
    strategy: { type: 'selective', keys: kw },
    position: { type: 'after_character_definition', order: ORDER_BASIC },
  };
}

function 调色盘条目(名) {
  const kw = 关键词(名);
  return {
    path: `世界书/角色/${名}/性格调色盘.yaml`,
    scope: 'specific',
    part: 'personality',
    keywords: kw,
    abstract: `${名}的性格调色盘：底色、主色调、点缀与衍生，按章节推进分档`,
    enabled: true,
    strategy: { type: 'selective', keys: kw },
    position: { type: 'after_character_definition', order: ORDER_PERS },
  };
}

// 私密档案：逐部位身体底账，用 character_other 标签包裹（与既有 16 人同形）
function 私密档案条目(名) {
  const kw = 关键词(名);
  return {
    scope: 'specific',
    part: 'other',
    keywords: kw,
    abstract: `${名}的私密档案：外观逐部位、气味、分泌物、敏感带、名器、性癖`,
    contents: [
      { content: `---\n<character_other character="${名}">` },
      { file: `世界书/角色/${名}/私密.yaml` },
      { content: '</character_other>' },
    ],
    enabled: true,
    strategy: { type: 'selective', keys: kw },
    position: { type: 'after_character_definition', order: ORDER_NSFW },
  };
}

// 私密阶段：EJS 分档，纯 path（与既有 16 人同形）
function 私密阶段条目(名) {
  const kw = 关键词(名);
  return {
    path: `世界书/角色/${名}/私密阶段.yaml`,
    scope: 'specific',
    part: 'other',
    keywords: kw,
    abstract: `${名}的私密阶段：随剧情轴递进的分档表现`,
    enabled: true,
    strategy: { type: 'selective', keys: kw },
    position: { type: 'after_character_definition', order: ORDER_TIER },
  };
}

function 有(名, 文件) {
  return fs.existsSync(path.join(ROLE, 名, 文件));
}

const ops = [];
const 待删文件 = [];
const 缺文件 = [];

// A 组：移除 NPC 注册 + 删文件 + 注册 角色四件
for (const 名 of 升格) {
  if (st.entryManifest.NPC?.[名]) ops.push({ op: 'remove', path: `/entryManifest/NPC/${名}` });
  else console.log(`⚠ NPC 注册里没有 ${名}`);

  if (有(名, '基础信息.yaml')) {
    ops.push({ op: 'add', path: `/entryManifest/角色/${名}_基础信息`, value: 基础信息条目(名) });
  } else 缺文件.push(`${名}/基础信息.yaml`);

  if (有(名, '性格调色盘.yaml')) {
    ops.push({ op: 'add', path: `/entryManifest/角色/${名}_性格调色盘`, value: 调色盘条目(名) });
  } else 缺文件.push(`${名}/性格调色盘.yaml`);

  const f = path.join(NPC, `${名}.yaml`);
  if (fs.existsSync(f)) 待删文件.push(f);
}

// B/C 组：注册 性格调色盘（安瑞达另有私密，走下面的 补私密 循环）
for (const 名 of 补调色盘) {
  if (有(名, '性格调色盘.yaml')) {
    ops.push({ op: 'add', path: `/entryManifest/角色/${名}_性格调色盘`, value: 调色盘条目(名) });
  } else 缺文件.push(`${名}/性格调色盘.yaml`);
}

// 私密两件：A 组 8 人 + 安瑞达
for (const 名 of 补私密) {
  if (有(名, '私密.yaml')) {
    ops.push({ op: 'add', path: `/entryManifest/角色/${名}_私密档案`, value: 私密档案条目(名) });
  } else 缺文件.push(`${名}/私密.yaml`);

  if (有(名, '私密阶段.yaml')) {
    ops.push({ op: 'add', path: `/entryManifest/角色/${名}_私密阶段`, value: 私密阶段条目(名) });
  } else 缺文件.push(`${名}/私密阶段.yaml`);
}

fs.writeFileSync('src/兽血沸腾/tools/patch-female.json', JSON.stringify(ops, null, 2), 'utf8');
console.log(`\n补丁: ${ops.length} 个 op（remove ${ops.filter(o => o.op === 'remove').length} / add ${ops.filter(o => o.op === 'add').length}）`);
console.log(`→ src/兽血沸腾/tools/patch-female.json`);

if (缺文件.length) {
  console.log(`\n⚠ 还缺 ${缺文件.length} 个文件，未生成对应 op：`);
  缺文件.forEach(f => console.log('  ' + f));
}

// 待删的 NPC 文件写成一个清单，交给下一步执行
fs.writeFileSync('src/兽血沸腾/tools/patch-female-delfiles.json', JSON.stringify(待删文件, null, 2), 'utf8');
console.log(`\n待删 NPC 文件 ${待删文件.length} 个 → tools/patch-female-delfiles.json`);
待删文件.forEach(f => console.log('  ' + f));

// 关键词冲突检查
const seen = new Map(), dup = [];
for (const 名 of [...升格, ...补调色盘]) for (const k of 关键词(名)) {
  if (seen.has(k)) dup.push(`${k}: ${seen.get(k)} ↔ ${名}`); else seen.set(k, 名);
}
console.log(`\n新增关键词彼此冲突: ${dup.length}`);
dup.forEach(d => console.log('  ' + d));
