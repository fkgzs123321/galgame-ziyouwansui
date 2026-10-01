import fs from 'fs';
import path from 'path';
const ROOT = 'src/兽血沸腾';
const s = JSON.parse(fs.readFileSync(`${ROOT}/tavern-cards-state.json`, 'utf8'));
const M = s.entryManifest['时间线'];
const resolve = v => (v.path ?? v.contents?.find(c => c.file)?.file);

console.log('══ 时间线 plot：全部 10 条的章节区间 + 首行 ══\n');
for (const [k, v] of Object.entries(M)) {
  if (v.part !== 'plot') continue;
  const p = path.join(ROOT, resolve(v));
  const t = fs.readFileSync(p, 'utf8');
  const lines = t.split('\n');
  const rng = lines.find(l => l.includes('章节序号区间'));
  const span = lines.find(l => l.includes('章节区间'));
  console.log(`【${k}】strategy=${v.strategy?.type}`);
  console.log(`   ${span?.trim() ?? '(无)'}`);
  console.log(`   ${rng?.trim() ?? '(无)'}  ← 能否据此加 @@if 守卫: ${rng ? '能' : '不能'}`);
  console.log(`   行数=${lines.length} 字节=${t.length}  首行=${lines[0].slice(0, 40)}`);
  // 是否提到结局
  const end = /大结局|终战|决战|幕后黑手|送回地球|战死|陨落/.test(t);
  console.log(`   含结局词: ${end ? '⚠ 是' : '否'}\n`);
}

console.log('\n══ 时间线 history：7 篇「编年」的章节区间 ══\n');
for (const [k, v] of Object.entries(M)) {
  if (v.part !== 'history') continue;
  if (!k.includes('编年')) continue;
  const t = fs.readFileSync(path.join(ROOT, resolve(v)), 'utf8');
  const lines = t.split('\n');
  const rng = lines.find(l => /章节序号|章节区间/.test(l));
  console.log(`【${k}】${v.strategy?.type}  ${rng?.trim() ?? '(无区间字段!)'}  首行=${lines[0].slice(0, 30)}`);
}
