import fs from 'fs';
import path from 'path';
const ROOT = 'src/兽血沸腾';
const s = JSON.parse(fs.readFileSync(`${ROOT}/tavern-cards-state.json`, 'utf8'));
const T = s.entryManifest['时间线'];

const CHR = ['荒岛篇编年', '胸罩岛篇编年', '海上篇编年', '多瑙大荒原篇编年', '博格村与领地初建编年', '翡冷翠领主期编年', '纵横篇编年'];
console.log('══ 7 篇编年：注册形态 + 规模 + 首末节点 ══\n');
for (const k of CHR) {
  const v = T[k];
  const p = path.join(ROOT, v.path ?? v.contents?.find(c => c.file)?.file);
  const t = fs.readFileSync(p, 'utf8');
  const lines = t.split('\n');
  const tops = lines.filter(l => /^[^\s#]/.test(l) && l.trim());
  console.log(`【${k}】`);
  console.log(`   注册: ${v.path ? 'path(纯YAML)' : 'contents(XML)'}  strategy=${v.strategy?.type}  part=${v.part}`);
  console.log(`   规模: ${t.length} B / ${lines.length} 行   顶层节点 ${tops.length} 个`);
  console.log(`   首节点: ${tops[0]?.slice(0, 40)}`);
  console.log(`   末节点: ${tops[tops.length - 1]?.slice(0, 40)}\n`);
}

console.log('══ 9 篇进度：注册形态 ══\n');
for (const [k, v] of Object.entries(T)) {
  if (v.part !== 'plot') continue;
  console.log(`  ${k.padEnd(22)} ${v.path ? 'path(纯YAML)' : 'contents(XML)'}  ${v.strategy?.type}  L1=${fs.readFileSync(path.join(ROOT, v.path), 'utf8').split('\n')[0].slice(0, 46)}`);
}
