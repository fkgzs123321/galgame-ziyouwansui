// C 桶硬登场门：文件首行已是 @@private 的条目（34 性格调色盘 + 25 私密阶段）。
// 依据 conventions.md L206-212：一个条目只能有一个装饰器，因此不能再往 contents 里加 @@if，
// 只能走「段落控制」——在内容文件内用 <%_ if (chap >= N) { _%> 包住正文。
// 与 时间线/*.yaml 的既有写法完全一致（@@private + const chap + 分段 <%_ if _%>）。
//
// 注意：部分 私密阶段.yaml 自己已经声明了 const chap（用于阶段分档），
// 重复声明会触发 Identifier 'chap' has already been declared，因此按需补声明。
import fs from 'fs';

const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));
const era = JSON.parse(fs.readFileSync(`${PROJ}/tools/era-table.json`, 'utf8'));
const 登场 = new Map();
for (const r of era.表) 登场.set(`${r.类型}/${r.名}`, r.登场);

const CONST行 = `<%_ const chap = getvar('stat_data.剧情.章节序号', { defaults: 0 }); _%>`;
const dry = process.argv.includes('--dry');

let 处理 = 0, 跳过 = [], 明细 = [];

for (const [名, v] of Object.entries(st.entryManifest.角色)) {
  const f = v.path || (v.contents || []).find(c => c.file)?.file;
  if (!f || !fs.existsSync(`${PROJ}/${f}`)) continue;
  let raw = fs.readFileSync(`${PROJ}/${f}`, 'utf8');
  if (!raw.startsWith('@@private')) continue;          // 只处理 C 桶

  // 归属人物
  let 人 = null;
  for (const k of 登场.keys()) {
    if (!k.startsWith('角色/')) continue;
    const nm = k.slice(3);
    if (名 === nm || 名.startsWith(nm + '_')) { 人 = nm; break; }
  }
  if (!人) { 跳过.push(`${名}: 无登场`); continue; }
  const d = 登场.get(`角色/${人}`);
  if (!(d > 0)) { 跳过.push(`${名}: 登场=0`); continue; }

  if (/<%_\s*if\s*\(\s*chap\s*>=/.test(raw)) { 跳过.push(`${名}: 已有 chap 门`); continue; }
  if (raw.includes('__ERA_GATE__')) { 跳过.push(`${名}: 已加过`); continue; }

  const L = raw.split('\n');
  // L0 = @@private，其后可能跟若干 <%_ const ... _%> 声明行。
  // 门必须插在这些声明【之后】：块作用域里 const 会提升到块顶并处于 TDZ，
  // 若把 <%_ if (chap >= N) _%> 放在 <%_ const chap = ... _%> 之前，
  // 条件求值时 chap 仍在暂时性死区，运行时会抛 ReferenceError。
  let 插入点 = 0;
  while (插入点 < L.length && /^\s*(@@\w+|<%_\s*const\s[^%]*_%>)\s*$/.test(L[插入点])) 插入点++;
  const 有const = /^\s*<%_\s*const\s/.test(L[1] ?? '');
  const 已声明chap = /<%_\s*const\s+chap\b/.test(raw);

  const 新 = [];
  新.push(...L.slice(0, 插入点));
  if (!已声明chap) 新.push(CONST行);
  新.push(`<%_ if (chap >= ${d}) { _%>`);
  新.push(...L.slice(插入点));
  // 去掉结尾多余空行后补收尾
  while (新.length && 新[新.length - 1].trim() === '') 新.pop();
  新.push('<%_ } _%>');
  新.push('');

  const 文本 = 新.join('\n');
  if (!dry) fs.writeFileSync(`${PROJ}/${f}`, 文本, 'utf8');
  处理++;
  明细.push(`${名} 登场=${d} ${f} 原有const=${有const} 已声明chap=${已声明chap}`);
}

console.log(`${dry ? '[DRY] ' : ''}已加 C 桶登场门 ${处理} 个`);
for (const x of 明细) console.log('   ✓ ' + x);
console.log(`\n跳过 ${跳过.length}:`);
for (const x of 跳过) console.log('   - ' + x);
