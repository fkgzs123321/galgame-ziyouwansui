// 为一个角色生成「纪元分档改写」工作简报：该文件全部待分档处 + 当前文件全文。
// 用法：node make-era-brief.mjs <角色名>  → 写 tools/brief/<角色名>.txt
// 之所以要生成简报：分档改写要同时看到「哪些字段是终局态」和「字段现在怎么写的」，
// 让执行者自己去 grep 极易漏项，这一层由脚本固定下来。
import fs from 'node:fs';
import path from 'node:path';

const 名 = process.argv[2];
if (!名) { console.error('用法: node make-era-brief.mjs <角色名>'); process.exit(1); }

const queue = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/demote-queue.json', 'utf8'));
let 本角色 = queue.filter(q => q.文件.includes(`\\${名}\\`) || q.文件.includes(`/${名}/`));

// 检测器会漏：era-table 只覆盖 165 人，未收录的角色整份文件都不在队列里，
// 于是「后来成了…」这类终局态永远不会被报出来（例：耐温尔因克）。
// 漏了就退化成本地扫描，保证每个角色都能拿到简报。
let 来源 = 'demote-queue.json';
if (!本角色.length) {
  // NPC 条目在 世界书/NPC/<名>.yaml，形状与角色目录不同，路径要单独试。
  const 候选 = [
    `src/兽血沸腾/世界书/角色/${名}/基础信息.yaml`,
    `src/兽血沸腾/世界书/NPC/${名}.yaml`,
  ];
  const 目标 = 候选.find(p => fs.existsSync(p));
  if (!目标) { console.error(`${名} 既不在队列里，也找不到条目文件`); process.exit(1); }
  const 未来 = /后为|后任|后来|最终|结局|终成|升任|改任|继任|即位|称帝|追封|此后|日后|最后成|当上|被提为|新任|现状/;
  const Ls = fs.readFileSync(目标, 'utf8').split('\n');
  let 节名 = '?', 键名 = '?';
  Ls.forEach((L, i) => {
    const t = L.trim();
    if (!t || t.startsWith('#')) return;
    const ind = L.match(/^\s*/)[0].length;
    const kv = t.match(/^([^:：]+):\s*(.*)$/);
    if (!kv) return;
    if (ind === 0) 节名 = kv[1];
    else if (ind === 2) 键名 = kv[1];
    if (未来.test(kv[2])) {
      本角色.push({ 桶: '本地扫描', 名, 节: 节名, 键: 键名, 行: i + 1, 文件: 目标.replace('src/兽血沸腾/', ''), 建议下界: '', 文: kv[2] });
    }
  });
  来源 = '本地扫描（检测器漏报）';
}

if (!本角色.length) { console.error(`${名} 待分档处为 0`); process.exit(1); }

const 文件 = 'src/兽血沸腾/' + 本角色[0].文件.replace(/\\/g, '/');
const 正文 = fs.readFileSync(文件, 'utf8');
const 表 = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-table.json', 'utf8'));
const 表行 = (表.表 ?? 表).find(r => r.名 === 名 || r.命中名 === 名);

const out = [];
out.push(`═══ 角色：${名} ═══`);
out.push(`文件：${文件}`);
out.push(`登场：${表行 ? 表行.登场 : '（era-table 未收录，需自行从原文核）'}`);
out.push(`待分档处：${本角色.length}（来源：${来源}）`);
out.push('');
out.push('── 待分档清单（节 / 键 / 原文 / 脚本建议下界）──');
for (const q of 本角色) {
  out.push(`L${q.行} [${q.桶}] ${q.节 ?? '?'}/${q.键 ?? '?'}  建议下界=${q.建议下界 ?? '（空）'}`);
  out.push(`     文：${q.文}`);
}
out.push('');
out.push('── 当前文件全文 ──');
正文.split('\n').forEach((L, i) => out.push(`${String(i + 1).padStart(4)}| ${L}`));

const dir = 'src/兽血沸腾/tools/brief';
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${名}.txt`), out.join('\n'), 'utf8');
console.log(`已写 ${dir}/${名}.txt（${本角色.length} 处，${正文.split('\n').length} 行）`);
