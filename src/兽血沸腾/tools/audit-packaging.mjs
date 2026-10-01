import fs from 'fs';

const raw = fs.readFileSync('src/兽血沸腾/兽血沸腾.json', 'utf8');
const d = JSON.parse(raw);
const ext = d.data.extensions;

console.log('══ regex_scripts ══');
(ext.regex_scripts ?? []).forEach(r => console.log(`  ${r.disabled ? '✗停用' : '✓启用'}  ${r.scriptName}`));

console.log('\n══ tavern_helper ══');
const th = ext.tavern_helper ?? {};
console.log('  键:', Object.keys(th).join(' / '));
// 成品中 scripts 是数组；state 文件中是对象。两种形态都要认得。
const scriptList = Array.isArray(th.scripts)
  ? th.scripts.map(s => [s.name, s])
  : Object.entries(th.scripts ?? {});
console.log('  scripts:', scriptList.map(([k]) => k).join(', ') || '(空)');
for (const [k, v] of scriptList) {
  const body = typeof v === 'string' ? v : (v.content ?? JSON.stringify(v));
  console.log(`   · ${k}: ${String(body).length} B  enabled=${v.enabled ?? '-'}`);
}

console.log('\n══ depth_prompt ══');
console.log(' ', JSON.stringify(ext.depth_prompt)?.slice(0, 400));

console.log('\n══ 打包清单五个正则是否齐备 ══');
const need = ['对AI隐藏状态栏', '状态栏界面', '对AI隐藏变量更新', '变量更新中美化', '变量更新美化'];
const have = (ext.regex_scripts ?? []).map(r => r.scriptName);
need.forEach(n => console.log(`  ${have.includes(n) ? '✓' : '✗ 缺失'}  ${n}`));

console.log('\n══ MVU 脚本注册 ══');
const names = scriptList.map(([k]) => k);
console.log(`  MVU 脚本: ${names.includes('MVU') ? '✓ 已注册' : '✗ 未注册'}`);
console.log(`  Zod 脚本: ${names.includes('Zod') ? '✓ 已注册' : '✗ 未注册'}`);
const zodEntry = scriptList.find(([k]) => k === 'Zod')?.[1];
console.log(`  Zod 是否含 registerMvuSchema: ${String(zodEntry?.content ?? '').includes('registerMvuSchema') ? '✓' : '✗'}`);
console.log(`  MVU 是否指向 MagVarUpdate: ${String(scriptList.find(([k]) => k === 'MVU')?.[1]?.content ?? '').includes('MagVarUpdate') ? '✓' : '✗'}`);

console.log('\n══ state.zod ══');
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
console.log(`  state.zod.schemaPath: ${st.zod?.schemaPath ?? '(无)'}`);
console.log(`  mvu: ${st.mvu}`);
