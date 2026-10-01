// 从名册各角色的 私密.yaml 抽出「部位词表」，生成 界面/私密部位.ts，
// 供 HaremPanel 的房事编辑器渲染按钮。
//
// 设计：**原装十五处是固定契约**（奶子/奶头/乳晕/逼/阴唇/阴蒂/屁眼/腰/臀/腿/足/手/口/腋/发），
// 每个角色在前端都显示同样这 15 个槽位，房事熟练度按槽位记，界面才整齐、才可比。
// 但各档案对同一处的命名并不统一 —— 早期有 13 份把 阴唇 并进了 逼，另有
// 腰腹 / 臀部 / 口舌 / 腋下 / 发肤 这类复合写法。故另出一张 档案键 映射，
// 记下该角色的档案里这一处实际叫什么，供查证与原样引用，不做改名。
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const PROJ = 'src/兽血沸腾';
const ROSTER = [
  // 原 16 人名册
  '凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝', '贞德', '白素青',
  '谭雅', '阿仙奴', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕',
  // A 组：由女性 NPC 升格为角色级的 8 人（成年）
  '幽月儿', '加茜娅', '伦娜', '费雯丽', '朝河兰', '珍妮佛', '波姬小丝', '赫莲娜',
  // 安瑞达：按成年女性处理（一万余岁，详见 术语纪律.md 的形体裁定）
  '安瑞达',
];

/** 原装十五处的固定契约，顺序即前端按钮顺序（用户指定的必须逐项覆盖的部位） */
const 原装 = ['奶子', '奶头', '乳晕', '逼', '阴唇', '阴蒂', '屁眼', '腰', '臀', '腿', '足', '手', '口', '腋', '发'];

/** 档案里对同一处的异名写法：契约名 → 档案里可能的键名（按优先级） */
const 异名 = {
  阴唇: ['阴唇'],
  腰: ['腰腹', '腰'],
  臀: ['臀部', '臀'],
  口: ['口舌', '口'],
  腋: ['腋下', '腋'],
  发: ['发肤', '发'],
};

/** 概览性键，不是可开发的部位，从异体里剔除 */
const 非部位键 = new Set(['标志', '身量']);

const 档案键 = {}; // 角色 → { 契约名: 档案里的真实键 }
const 异体表 = {}; // 角色 → 该角色独有的异体部位
const 缺项 = []; // 契约名在档案里完全找不到的角色
const 原貌表 = {}; // 角色 → 外观段的全部键名，供查证
const 待写 = []; // 名册里还没写 私密.yaml 的人；跳过而不报错，便于边补边重跑

for (const 名 of ROSTER) {
  const f = path.join(PROJ, '世界书/角色', 名, '私密.yaml');
  if (!fs.existsSync(f)) {
    待写.push(名);
    continue;
  }
  const doc = YAML.parse(fs.readFileSync(f, 'utf8'));
  const 外观 = doc['外观'];
  if (!外观 || typeof 外观 !== 'object') throw new Error(`${名}: 私密.yaml 无 外观 段`);
  const keys = Object.keys(外观);
  if (keys.length < 8) throw new Error(`${名}: 外观 段只有 ${keys.length} 个键，疑似漏写`);

  原貌表[名] = keys;
  档案键[名] = {};
  for (const 契约 of 原装) {
    const 候选 = 异名[契约] ?? [契约];
    const 命中 = 候选.find(k => keys.includes(k));
    if (命中) 档案键[名][契约] = 命中;
    else 缺项.push(`${名}.${契约}`);
  }
  // 异体 = 既不是契约名、也不是契约名的异名、也不是概览键
  const 契约全部写法 = new Set(原装.flatMap(c => 异名[c] ?? [c]));
  异体表[名] = keys.filter(k => !契约全部写法.has(k) && !非部位键.has(k));
}

if (缺项.length) console.log(`⚠ 契约部位在档案里找不到（前端仍会给槽位，但档案无对应描写）: ${缺项.join('、')}`);
if (待写.length) console.log(`ℹ 尚未写 私密.yaml，本次跳过: ${待写.join('、')}`);

const out = `// 由 tools/extract-nsfw-parts.mjs 自动生成，不要手改。
// 原装十五处是固定契约，每个角色在前端都显示同样这 15 个槽位；
// 异体部位（蚌壳、蛇尾、羽翅、珊瑚胶体、九头蛇身……）按角色追加在后面。
// 档案键 记下该角色的 私密.yaml 里这一处实际写成了什么键名（腰腹/臀部/口舌/腋下/发肤 等），
// 用于查证与原样引用，前端不做改名。

/** 原装十五处，顺序即前端按钮顺序 */
export const 原装部位 = ${JSON.stringify(原装, null, 2)} as const;

/** 角色 → 该角色独有的异体部位 */
export const 异体部位表: Record<string, string[]> = ${JSON.stringify(异体表, null, 2)};

/** 角色 → 契约名 → 她的 私密.yaml 里实际使用的键名（缺项则无此键） */
export const 档案键表: Record<string, Record<string, string>> = ${JSON.stringify(档案键, null, 2)};

/** 角色 → 该角色档案里实有的全部键名，供查证 */
export const 私密部位表: Record<string, string[]> = ${JSON.stringify(原貌表, null, 2)};

/**
 * 取某角色要显示的部位名：固定 15 个原装槽位 + 她的异体部位。
 * **以 档案键表 为准判断她有没有 私密档案**（不是 异体部位表——有些角色
 * 外观段全是契约名与概览键，异体部位为空数组，用后者会把她们误判成没档案、
 * 前端就不给她们开房事底账）。没有档案的角色返回空数组。
 */
export function 部位名列表(名: string): string[] {
  if (!档案键表[名]) return [];
  return [...原装部位, ...(异体部位表[名] ?? [])];
}

/** 该角色的档案里，这个部位实际写成了什么键名；没有对应描写时返回 undefined */
export function 档案键(名: string, 契约: string): string | undefined {
  return 档案键表[名]?.[契约];
}
`;

fs.writeFileSync(path.join(PROJ, '界面/私密部位.ts'), out, 'utf8');
console.log(`✓ ${Object.keys(档案键).length}/${ROSTER.length} 角色 → ${path.join(PROJ, '界面/私密部位.ts')}  ${Buffer.byteLength(out, 'utf8')} B`);
console.log(`原装契约 ${原装.length} 处，异体部位:`);
for (const 名 of Object.keys(档案键)) console.log(`  ${名.padEnd(8)} 异体: ${(异体表[名] ?? []).join('/') || '无'}`);
