// 只读：把「身份/剧情耦合」量化。
// 目标：找出「登场早、但条目写的是晚期状态」的角色，并列出到底哪些小节是纪元绑定的。
// 判定：登场 <= 245（能在「纵横·成长期」开局出场）且小节命中终局锚点。
import fs from 'fs';
import path from 'path';

const ROLE = 'src/兽血沸腾/世界书/角色';
const era = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-table.json', 'utf8'));
const 登场 = new Map(era.表.map(r => [r.名, r.登场]));

// 终局锚点：只有剧情走到后期才会成立的说法
const 终局锚 = [
  '剑桥大祭师', '领主夫人', '第一任院长', '红衣大祭司', '维安大萨满', '神曲萨满',
  '王后', '皇后', '摄政', '大祭师', '花王', '花中皇后', '教女', '妻室', '妻子',
  '结发', '成亲', '珠胎', '母亲身份', '育有', '为他生下', '子嗣', '殉', '阵亡', '战死',
  '已死', '继位', '加冕', '册封', '追封', '封为', '摄政公爵', '大内侍卫', '第一夫人',
  '领主', '后宫', '婚约', '订婚', '夫婿', '丈夫', '妻',
];
// 未来兑现动词
const 未来词 = /后为|后任|后来|最终|结局|终成|升任|改任|继任|即位|称帝|追封|此后|日后|最后成/;

// 注意：本卡的 基础信息.yaml 有两种形态——多顶层键，或单一顶层键「角色档案:」再嵌一层。
// 因此小节必须以「同级下一个键」为界，不能以列 0 为界，否则单顶层键的文件会一路扫到 EOF。
function 小节(L, 起) {
  if (起 < 0) return [];
  const 本缩进 = L[起].match(/^\s*/)[0].length;
  const out = [];
  for (let i = 起 + 1; i < L.length; i++) {
    const l = L[i];
    if (!l.trim()) continue;
    const ind = l.match(/^\s*/)[0].length;
    if (ind <= 本缩进) break;               // 同级或更外层 → 本小节结束
    const m = l.match(/^(\s+)([^\s#][^:]*?)\s*[:：]\s*(.*)$/);
    if (m) out.push({ 键: m[2].trim(), 缩进: m[1].length, 行: i + 1, 文: m[3].trim(), 段: [] });
    else if (out.length && /^\s*\|/.test(l)) out[out.length - 1].段.push(l.trim());
  }
  return out;
}

const 顶层键 = L => L.filter(l => /^\S/.test(l) && /[:：]\s*$/.test(l)).map(l => l.replace(/[:：]\s*$/, '').trim());

const rows = [];
for (const d of fs.readdirSync(ROLE, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const p = path.join(ROLE, d.name, '基础信息.yaml');
  if (!fs.existsSync(p)) continue;
  const L = fs.readFileSync(p, 'utf8').split('\n');
  const 名 = d.name, 首 = 登场.get(名);
  const 顶层 = 顶层键(L);
  // 收集所有二级小节（含 角色档案 嵌套层）
  const 全部 = [];
  for (const n of ['基本信息', '外貌特征', '背景设定', '能力体系', '关系设定', '随身物品', '语言特征']) {
    for (const m of L.keys()) {
      if (new RegExp(`^\\s*${n}\\s*[:：]`).test(L[m])) { 全部.push(...小节(L, m).map(x => ({ ...x, 节: n }))); break; }
    }
  }
  if (!全部.length) continue;
  const 命中 = 全部.map(x => {
    const t = x.文 + (x.段.length ? '\n' + x.段.join('\n') : '');
    const a = 终局锚.filter(w => t.includes(w));
    const f = 未来词.test(t);
    return { ...x, 锚: a, 未来: f };
  }).filter(x => x.锚.length || x.未来);
  rows.push({ 名, 登场: 首, 顶层, 命中, 小节数: 全部.length });
}

rows.sort((a, b) => (a.登场 ?? 999) - (b.登场 ?? 999));

const 实务 = rows.filter(r => (r.登场 ?? 999) <= 245 && (r.登场 ?? 999) >= 0);
console.log(`════ 实务集：登场 <= 245 且条目含终局/未来表述（共 ${实务.length} 人）════`);
console.log('（这些角色在自己的登场纪元就会被注入，硬门挡不住，必须软降级）\n');
for (const r of 实务) {
  console.log(`登场${String(r.登场).padStart(4)}  ${r.名}   条目共 ${r.小节数} 小节，命中 ${r.命中.length} 处`);
  for (const h of r.命中) {
    console.log(`        [${h.节}] ${h.键}  ${h.锚.length ? '锚:' + h.锚.join('/') : ''}${h.未来 ? ' 未来词' : ''}`);
    console.log(`            ${h.文.slice(0, 110)}`);
  }
}

console.log(`\n════ 其余（登场 > 245，硬门已足）════`);
for (const r of rows.filter(r => (r.登场 ?? 999) > 245)) {
  console.log(`登场${String(r.登场).padStart(4)}  ${r.名}  命中 ${r.命中.length} 处: ${r.命中.map(h => h.节 + '/' + h.键).slice(0, 6).join(', ')}`);
}
fs.writeFileSync('src/兽血沸腾/tools/era-faces.json', JSON.stringify(rows, null, 2), 'utf8');
console.log('\n→ 已写 tools/era-faces.json');
