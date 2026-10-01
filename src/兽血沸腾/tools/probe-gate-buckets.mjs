// 只读：把「要加硬登场门」的条目按「机制」分桶，确认没有装饰器叠用。
import fs from 'fs';

const PROJ = 'src/兽血沸腾';
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));
const era = JSON.parse(fs.readFileSync(`${PROJ}/tools/era-table.json`, 'utf8'));

// 目录/条目名 → 登场章
const 登场 = new Map();
for (const r of era.表) 登场.set(r.类型 + '/' + r.名, r.登场);

const 桶 = { A_contents自带头: [], B_path纯YAML: [], C_path自带装饰器: [], D_无登场: [], E_速览: [] };

for (const 类型 of ['角色', 'NPC']) {
  for (const [名, v] of Object.entries(st.entryManifest[类型])) {
    // 目录名允许含 `.`（海伦.列娜 / 福格森.徐）；条目名形如「目录_部件」。
    let 人 = null;
    if (类型 === 'NPC') 人 = 名;
    else {
      for (const [k] of 登场) {
        if (!k.startsWith(类型 + '/')) continue;
        const nm = k.slice(类型.length + 1);
        if (名 === nm || 名.startsWith(nm + '_')) { 人 = nm; break; }
      }
    }
    if (名 === '角色速览') { 桶.E_速览.push(名); continue; }
    if (!人 || !登场.has(类型 + '/' + 人)) { 桶.D_无登场.push(`${类型}/${名} → 人=${人}`); continue; }

    const f = v.path || (v.contents || []).find(c => c.file)?.file;
    let 首行 = '';
    if (f && fs.existsSync(`${PROJ}/${f}`)) 首行 = (fs.readFileSync(`${PROJ}/${f}`, 'utf8').split('\n')[0] || '').trim();

    if (v.contents) {
      // contents 形态：XML 包装写在 contents 里。危险组合 = 文件本体首行也是 @@
      // （那会让 resolveLeafContent 拼出两个装饰器）。
      if (首行.startsWith('@@'))
        桶.A_contents自带头.push(`${类型}/${名} 文件首行「${首行}」`);
      else
        桶.B_path纯YAML.push(`${类型}/${名} (contents，文件无装饰器) 登场=${登场.get(类型 + '/' + 人)}`);
    } else if (首行.startsWith('@@')) {
      桶.C_path自带装饰器.push(`${类型}/${名} 登场=${登场.get(类型 + '/' + 人)} 首行「${首行}」`);
    } else {
      桶.B_path纯YAML.push(`${类型}/${名} 登场=${登场.get(类型 + '/' + 人)} 首行「${首行}」`);
    }
  }
}

console.log('══ 分桶 ══');
console.log(`A 角色 contents（已有 XML 包装）      : ${桶.A_contents自带头.filter(Boolean).length}`);
console.log(`B path 纯 YAML（无装饰器，可直接加 @@if）: ${桶.B_path纯YAML.length}`);
console.log(`C path 自带 @@ 装饰器（需段落控制）    : ${桶.C_path自带装饰器.length}`);
console.log(`D 找不到登场章                        : ${桶.D_无登场.length}`);
console.log(`E 角色速览（待拆）                    : ${桶.E_速览.length}`);

console.log('\n── A 里首行是 @@ 的（危险：会叠装饰器）──');
const 险A = 桶.A_contents自带头.filter(Boolean);
console.log(险A.length ? 险A.join('\n') : '   无 ✓');

console.log('\n── C 桶明细（前 70）──');
桶.C_path自带装饰器.slice(0, 70).forEach(x => console.log('   ' + x));

console.log('\n── B 桶里的 NPC 首行样例 ──');
桶.B_path纯YAML.filter(x => x.includes('NPC')).slice(0, 5).forEach(x => console.log('   ' + x));

console.log('\n── D 桶 ──');
桶.D_无登场.forEach(x => console.log('   ⚠ ' + x));
