// 生成「硬登场门」补丁。
// 机制（依据 conventions.md L198-211）：
//   · 条目显隐 = 在 contents 首片段嵌入 @@if，不改内容文件；
//   · 登场门只写 `>= N`（章节序号只增不减），因此不需要上界；
//   · 一个条目只能有一个装饰器 ⇒ 只处理「文件首行不是 @@」的条目（B 桶）。
//     C 桶（文件首行 @@private）走内容文件的段落控制，由另一支脚本处理。
// 输出 tools/patch-era-gate.json + 报告。
import fs from 'fs';

const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));
const era = JSON.parse(fs.readFileSync(`${PROJ}/tools/era-table.json`, 'utf8'));

const 登场 = new Map();
for (const r of era.表) 登场.set(`${r.类型}/${r.名}`, r.登场);

const 门 = n => `@@if getvar('stat_data.剧情.章节序号', { defaults: 0 }) >= ${n}`;

const ops = [];
const 报告 = [];
const 跳过 = { 无登场: [], 已为0: [], C桶: [], 速览: [], 已有门: [] };

for (const 类型 of ['角色', 'NPC']) {
  for (const [名, v] of Object.entries(st.entryManifest[类型])) {
    if (名 === '角色速览') { 跳过.速览.push(名); continue; }

    // 归属人物
    let 人 = null;
    if (类型 === 'NPC') 人 = 名;
    else {
      for (const k of 登场.keys()) {
        if (!k.startsWith('角色/')) continue;
        const nm = k.slice(3);
        if (名 === nm || 名.startsWith(nm + '_')) { 人 = nm; break; }
      }
    }
    if (!人 || !登场.has(`${类型}/${人}`)) { 跳过.无登场.push(`${类型}/${名}`); continue; }
    const d = 登场.get(`${类型}/${人}`);
    if (!(d > 0)) { 跳过.已为0.push(`${类型}/${名}`); continue; }

    // 内容文件首行
    const f = v.path || (v.contents || []).find(c => c.file)?.file;
    const 首行 = f && fs.existsSync(`${PROJ}/${f}`)
      ? (fs.readFileSync(`${PROJ}/${f}`, 'utf8').split('\n')[0] || '').trim() : '';
    if (首行.startsWith('@@')) { 跳过.C桶.push(`${类型}/${名} (登场${d})`); continue; }

    const 首片 = (v.contents || [])[0];
    if (首片?.content && 首片.content.startsWith('@@if ')) { 跳过.已有门.push(`${类型}/${名}`); continue; }

    const 新值 = JSON.parse(JSON.stringify(v));
    if (v.contents) {
      // XML 包装形态：门插到最前，XML 标签留在原位
      新值.contents = [{ content: 门(d) }, ...v.contents];
    } else {
      // 纯 path 形态：改为 contents = [门, 文件]
      delete 新值.path;
      新值.contents = [{ content: 门(d) }, { file: v.path }];
    }
    ops.push({ op: 'add', path: `/entryManifest/${类型}/${名}`, value: 新值 });
    报告.push(`${类型}/${名} 登场=${d} ${v.contents ? 'XML' : 'plain'}`);
  }
}

console.log(`══ 将加门的条目 ${ops.length} ══`);
const byEra = {};
const W = [['荒岛篇', 1, 8], ['胸罩岛篇', 9, 20], ['海上篇', 21, 30], ['多瑙大荒原篇', 31, 42], ['博格村与领地初建', 43, 58], ['翡冷翠领主期', 59, 72], ['纵横·成长期', 73, 244], ['纵横·扩张期', 245, 704], ['纵横·终盘', 705, 763]];
for (const r of 报告) {
  const d = Number(r.match(/登场=(\d+)/)[1]);
  const w = (W.find(([, a, b]) => d >= a && d <= b) || ['?'])[0];
  byEra[w] = (byEra[w] || 0) + 1;
}
for (const [n] of W) console.log(`  ${String(n).padEnd(18)} ${byEra[n] || 0}`);
console.log(`  ── 合计 ${Object.values(byEra).reduce((a, b) => a + b, 0)}`);

console.log('\n跳过统计:');
for (const [k, arr] of Object.entries(跳过)) console.log(`  ${k}: ${arr.length}`);

console.log('\n抽样（前 12）:');
for (const r of 报告.slice(0, 12)) console.log('   ' + r);

// XML 形态与 plain 形态各抽一个，打印拼接后的前 4 行，人工确认无空行、装饰器只有一个
const 演 = (leaf) => (leaf.contents || []).map(f => f.file ? fs.readFileSync(`${PROJ}/${f.file}`, 'utf8') : (f.content ?? '')).join('\n');
console.log('\n══ 拼接效果预演 ══');
for (const 类型 of ['角色', 'NPC']) {
  const hit = ops.find(o => o.path.startsWith(`/entryManifest/${类型}/`));
  if (!hit) continue;
  console.log(`\n【${类型}】${hit.path}`);
  const ls = 演(hit.value).split('\n');
  for (let i = 0; i < Math.min(4, ls.length); i++) console.log(`   ${i}: ${JSON.stringify(ls[i].slice(0, 110))}`);
  console.log(`   末行: ${JSON.stringify(ls[ls.length - 1].slice(0, 60))}`);
  console.log(`   装饰器行数: ${ls.filter(l => l.startsWith('@@')).length}`);
  console.log(`   第2行是否为空: ${ls[1].trim() === ''}`);
}

fs.writeFileSync(`${PROJ}/tools/patch-era-gate.json`, JSON.stringify(ops, null, 1), 'utf8');
fs.writeFileSync(`${PROJ}/tools/era-gate-report.txt`, 报告.join('\n'), 'utf8');
console.log(`\n→ 已写 tools/patch-era-gate.json（${ops.length} op）与 tools/era-gate-report.txt`);
