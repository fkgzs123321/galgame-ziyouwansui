// 从每个 私密阶段.yaml 里抽取档名与阈值，产出前端可直接消费的档位表。
// 输出：tools/nsfw-tiers.json  { 角色: { 轴, 阈值:[..], 档名:[..] } }
import fs from 'fs';
import path from 'path';

const PROJ = 'src/兽血沸腾';
const DIR = path.join(PROJ, '世界书/角色');

const out = {};
const rows = [];

for (const name of fs.readdirSync(DIR)) {
  const f = path.join(DIR, name, '私密阶段.yaml');
  if (!fs.existsSync(f)) continue;
  const text = fs.readFileSync(f, 'utf8');
  const lines = text.split('\n');

  // 轴：从 getvar 行取路径末段（好感度 / 章节序号）
  const gv = text.match(/getvar\('([^']+)'/);
  if (!gv) { rows.push([name, '?', '', '', '未找到 getvar']); continue; }
  const axis = gv[1].split('.').pop();
  const varName = gv[1].match(/const\s+(\w+)/) ? null : null;
  const varMatch = text.match(/const\s+(\w+)\s*=\s*getvar/);
  const V = varMatch ? varMatch[1] : 'aff';

  // 阈值：按出现顺序取 if / else if 的比较值
  const thresholds = [];
  const tiers = [];
  const re = new RegExp(`<%_\\s*(?:\\}\\s*else\\s+if|if)\\s*\\(\\s*${V}\\s*<\\s*(\\d+)\\s*\\)\\s*\\{\\s*_%>`);
  let cur = null;
  for (const line of lines) {
    const m = line.match(re);
    if (m) { thresholds.push(Number(m[1])); cur = 'pending'; continue; }
    const t = line.match(/^阶段:\s*(.+)$/);
    if (t && cur === 'pending') { tiers.push(t[1].trim()); cur = null; }
  }
  // else 分支（最后一档）
  const lastTier = [...text.matchAll(/^阶段:\s*(.+)$/gm)].map(m => m[1].trim());
  if (lastTier.length > tiers.length) tiers.push(lastTier[lastTier.length - 1]);

  out[name] = { 轴: axis, 阈值: thresholds, 档名: tiers };
  rows.push([name, axis, thresholds.join('/'), tiers.join(' / '), tiers.length === thresholds.length + 1 ? 'ok' : `档数异常 ${tiers.length}vs${thresholds.length + 1}`]);
}

fs.writeFileSync(path.join(PROJ, 'tools/nsfw-tiers.json'), JSON.stringify(out, null, 2), 'utf8');

// 同时产出前端可直接 import 的 TS 模块（不改 tsconfig，走 ?raw 之外的普通模块导入）
const ts = [
  '// 由 tools/extract-nsfw-tiers.mjs 自动生成，不要手改。',
  '// 数据源：世界书/角色/{角色}/私密阶段.yaml 的档名与阈值。',
  '// 用途：状态栏「后宫与孕事」面板显示每个角色当前落在哪一档，并作为前端与条目的对账依据。',
  '',
  '/** 档位轴的取值来源 */',
  "export type 私密轴 = '好感度' | '章节序号';",
  '',
  'export interface 私密档位 {',
  '  /** 取值的 MVU 路径末段：好感度走 stat_data.关系.X.好感度，章节序号走 stat_data.剧情.章节序号 */',
  '  轴: 私密轴;',
  '  /** 升档阈值，长度 = 档名数 - 1 */',
  '  阈值: number[];',
  '  /** 各档名，顺序即由低到高 */',
  '  档名: string[];',
  '}',
  '',
  'export const 私密档位表: Record<string, 私密档位> = ' + JSON.stringify(out, null, 2) + ';',
  '',
  '/** 按轴取值算出角色落在第几档（0 起）。轴值缺失时返回 -1，调用方应显示为「未定」。 */',
  'export function 当前档位(角色: string, 轴值: number | undefined): number {',
  '  const t = 私密档位表[角色];',
  '  if (!t || 轴值 === undefined || Number.isNaN(轴值)) return -1;',
  '  let i = 0;',
  '  while (i < t.阈值.length && 轴值 >= t.阈值[i]) i += 1;',
  '  return i;',
  '}',
  '',
  '/** 下一档的阈值，已是末档时返回 null */',
  'export function 下一档阈值(角色: string, 轴值: number | undefined): number | null {',
  '  const t = 私密档位表[角色];',
  '  if (!t) return null;',
  '  const i = 当前档位(角色, 轴值);',
  '  return i >= 0 && i < t.阈值.length ? t.阈值[i] : null;',
  '}',
  '',
].join('\n');
fs.writeFileSync(path.join(PROJ, '界面/私密档位.ts'), ts, 'utf8');

console.log('角色'.padEnd(12) + '轴'.padEnd(10) + '阈值'.padEnd(16) + '档数'.padEnd(6) + '校验');
console.log('─'.repeat(78));
for (const [n, a, t, ti, v] of rows) {
  const cnt = ti ? ti.split(' / ').length : 0;
  console.log(n.padEnd(12) + a.padEnd(10) + t.padEnd(16) + String(cnt).padEnd(6) + v);
}
console.log(`\n共 ${Object.keys(out).length} 个角色 → tools/nsfw-tiers.json`);
