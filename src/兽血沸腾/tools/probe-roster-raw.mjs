import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书/角色';
const dirs = fs.readdirSync(ROOT, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();

const out = [];
for (const d of dirs) {
  const p = path.join(ROOT, d, '基础信息.yaml');
  if (!fs.existsSync(p)) { out.push({ d, raw: '(no file)' }); continue; }
  const L = fs.readFileSync(p, 'utf8').split('\n');
  const pick = re => { const m = L.find(l => re.test(l)); return m ? m.trim() : ''; };
  out.push({
    d,
    性别: pick(/性别:/),
    年龄: pick(/年龄:/),
    种族: pick(/种族:/),
    身份: pick(/身份:/),
    首行: L[0],
  });
}

console.log('══ 全部 53 个角色：性别 / 年龄 原始行 ══\n');
for (const r of out) {
  console.log(`【${r.d}】`);
  console.log(`   ${r.性别 || '(无性别行)'}`);
  console.log(`   ${r.年龄 || '(无年龄行)'}`);
  console.log(`   ${r.种族}`);
  console.log();
}

console.log('\n══ initvar 关系键 ══');
const iv = fs.readFileSync('src/兽血沸腾/世界书/变量/initvar.yaml', 'utf8');
const relIdx = iv.split('\n').findIndex(l => /^关系:/.test(l));
console.log(iv.split('\n').slice(relIdx, relIdx + 4).join('\n'));
const keys = [];
const lines = iv.split('\n');
for (let i = relIdx + 1; i < lines.length; i++) {
  if (/^\S/.test(lines[i])) break;
  const m = lines[i].match(/^ {2}([^\s:]+):/);
  if (m) keys.push(m[1]);
}
console.log('关系键:', keys.join('、'));
