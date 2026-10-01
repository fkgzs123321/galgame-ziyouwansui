import fs from 'fs';
const src = fs.readFileSync('src/兽血沸腾/世界书/角色/海伦.列娜/基础信息.yaml', 'utf8');
const vars = { 'stat_data.剧情.章节序号': Number(process.argv[2] ?? 82) };
const body = src.replace(
  /<%_\s*const\s+(\w+)\s*=\s*getvar\(\s*'([^']+)'\s*(?:,[^)]*)?\)\s*;\s*_%>/g,
  () => '<%_ __ASSIGN__ _%>',
);
const out = []; const stack = []; const active = () => stack.every(f => f.active);
let n = 0;
for (const line of body.split(/\r?\n/)) {
  const ctrl = line.match(/^\s*<%_\s*(.*?)\s*_%>\s*$/);
  if (!ctrl) { if (active()) out.push(line); continue; }
  const code = ctrl[1];
  if (code === '__ASSIGN__') continue;
  if (code === '}') { stack.pop(); continue; }
  const closes = (code.replace(/\([^()]*\)/g, '()').match(/\}/g) || []).length;
  let prev = null; for (let i = 0; i < closes; i++) prev = stack.pop();
  let cond = null, isElse = false;
  const ifm = code.match(/if\s*\((.*)\)\s*\{?\s*$/);
  if (ifm) {
    const expr = ifm[1].replace(/getvar\(\s*'([^']+)'\s*(?:,[^)]*)?\)/g, (m, k) => JSON.stringify(vars[k]));
    cond = eval(expr);
  } else if (/\belse\b/.test(code)) isElse = true;
  const parentActive = active();
  if (isElse) stack.push({ active: parentActive && !prev.taken, taken: true });
  else { const ct = prev ? prev.taken : false; const take = parentActive && !ct && !!cond; stack.push({ active: take, taken: ct || take }); }
  n++;
}
console.log(`控制行 ${n} 条，stack 残留 ${stack.length}`);
const t = out.join('\n');
t.split('\n').forEach((l, i) => { if (/身份|与主角关系|蜕变|刘震撼|国王|常服|随身/.test(l)) console.log(`L${i + 1}  ${l}`); });
