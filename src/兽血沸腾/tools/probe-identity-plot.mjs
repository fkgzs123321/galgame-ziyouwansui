// 只读：检查「身份」字段是否把多个纪元压在一行里（剧情跟不跟得上）。
// 用户问题：身份是带剧情走的，降级身份时必须连剧情一起降。
import fs from 'fs';
import path from 'path';

const ROLE = 'src/兽血沸腾/世界书/角色';
const era = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-table.json', 'utf8'));
const 登场 = new Map(era.表.map(r => [r.名, r.登场]));

// 「后为/后任/后来/最终/结局/成为」这类"未来兑现"标记
const 未来 = /后为|后任|后来|最终|结局|终成|升任|改任|继任|即位|加冕(?!战争祭祀)|称帝|封为|追封/;
// 一段身份里的纪元切分符
const 切 = /[；;]/;

const rows = [];
for (const d of fs.readdirSync(ROLE, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const p = path.join(ROLE, d.name, '基础信息.yaml');
  if (!fs.existsSync(p)) continue;
  const t = fs.readFileSync(p, 'utf8');
  const L = t.split('\n');
  // 找 身份: 行（可能在 基本信息 或 角色档案.基本信息 下）
  const i = L.findIndex(x => /^\s+身份\s*[:：]/.test(x));
  if (i < 0) { rows.push({ 名: d.name, 登场: 登场.get(d.name), 身份: null }); continue; }
  const 身份 = L[i].replace(/^\s+身份\s*[:：]\s*/, '').trim();
  rows.push({ 名: d.name, 登场: 登场.get(d.name), 身份, 行号: i + 1 });
}

const 有身份 = rows.filter(r => r.身份);
console.log(`角色目录 ${rows.length}，有 身份 字段 ${有身份.length}，无 ${rows.length - 有身份.length}`);

const 多段 = 有身份.filter(r => 切.test(r.身份));
const 含未来 = 有身份.filter(r => 未来.test(r.身份));
console.log(`\n身份字段含分号（多纪元压一行）: ${多段.length}`);
console.log(`身份字段含「后为/后来/最终/结局…」: ${含未来.length}`);

console.log('\n══ 含未来兑现标记的身份（这些必须随纪元降级）══');
含未来.sort((a, b) => (a.登场 ?? 99) - (b.登场 ?? 99)).forEach(r =>
  console.log(`   登场${String(r.登场).padStart(4)}  ${r.名.padEnd(14)} ${r.身份.slice(0, 100)}`));

console.log('\n══ 分号切开的段数分布 ══');
const 段数 = {};
for (const r of 多段) { const n = r.身份.split(切).length; 段数[n] = (段数[n] || 0) + 1; }
Object.entries(段数).sort((a, b) => a[0] - b[0]).forEach(([n, c]) => console.log(`   ${n} 段: ${c} 人`));

// 背景设定 / 关系设定 里是否有"以晚期身份为前提"的叙述
console.log('\n══ 背景设定 / 关系设定 里的未来锚点 ══');
const 锚 = ['剑桥大祭师', '领主夫人', '第一任院长', '红衣大祭司', '维安大萨满', '神曲萨满', '王后', '皇后', '大祭师', '摄政'];
for (const r of rows) {
  const p = path.join(ROLE, r.名, '基础信息.yaml');
  const L = fs.readFileSync(p, 'utf8').split('\n');
  // 只看 背景设定: / 关系设定: 之后的段
  const s = L.findIndex(x => /^\s*背景设定\s*[:：]/.test(x));
  const body = s >= 0 ? L.slice(s).join('\n') : '';
  const hit = 锚.filter(a => body.includes(a));
  if (hit.length) console.log(`   登场${String(r.登场).padStart(4)}  ${r.名.padEnd(14)} ${hit.join('、')}`);
}
