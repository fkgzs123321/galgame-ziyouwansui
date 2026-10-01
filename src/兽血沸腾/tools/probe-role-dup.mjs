import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const ROOT = 'src/兽血沸腾/世界书/角色';
const ROSTER = ['凝玉','艾薇尔','崔蓓茜','歌坦妮','若尔娜','黛丝','贞德','白素青','谭雅','阿仙奴','许德拉','歌莉妮','唐蓓尔金娜','梦露','嘉宝','艾莉婕'];
const W = 12;

const leaves = (obj, p = '', out = []) => {
  if (typeof obj === 'string') out.push([p, obj]);
  else if (Array.isArray(obj)) obj.forEach((v, i) => leaves(v, p + '[' + i + ']', out));
  else if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) leaves(v, p ? p + '/' + k : k, out);
  return out;
};
const frags = (s) => {
  const r = new Set();
  for (const seg of String(s).split(/[，。；、：！？\n「」（）()\[\]{}|]+/)) {
    const t = seg.trim();
    if (t.length < W) continue;
    for (let i = 0; i + W <= t.length; i++) r.add(t.slice(i, i + W));
  }
  return r;
};

// 基础信息 的每个子键 → 命中数
const tally = {};
const examples = {};
for (const n of ROSTER) {
  const fa = path.join(ROOT, n, '基础信息.yaml');
  const fb = path.join(ROOT, n, '性格调色盘.yaml');
  if (!fs.existsSync(fa) || !fs.existsSync(fb)) continue;
  const d = YAML.parse(fs.readFileSync(fa, 'utf8').replace(/^@@[^\n]*\n/, ''));
  const palRaw = fs.readFileSync(fb, 'utf8');
  const palFrags = new Set();
  for (const seg of palRaw.split(/[，。；、：！？\n「」（）()\[\]{}|]+/)) {
    const t = seg.trim();
    if (t.length < W) continue;
    for (let i = 0; i + W <= t.length; i++) palFrags.add(t.slice(i, i + W));
  }
  for (const [kp, s] of leaves(d, '')) {
    const top = kp.split('/')[0];
    const hit = [...frags(s)].filter((x) => palFrags.has(x)).length;
    if (hit) {
      tally[top] = (tally[top] || 0) + hit;
      (examples[top] ||= []).push(`${n}:${kp}`);
    }
  }
}
console.log('══ 基础↔调色盘 命中的片段来自 基础信息 的哪个子键 ══');
for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1]))
  console.log(`  ${k.padEnd(10)} ${String(v).padStart(4)} 处   例: ${examples[k].slice(0, 4).join('、')}`);

// 反向确认：私密 有没有部位词跟 基础信息 撞
console.log('\n══ 部位词是否在 基础信息 里出现（应尽量不出现）══');
const PARTS = ['奶子','奶头','乳晕','逼','阴唇','阴蒂','屁眼','阴茎','鸡巴','子宫','阴道','会阴','骚逼','屄'];
for (const n of ROSTER) {
  const fa = path.join(ROOT, n, '基础信息.yaml');
  if (!fs.existsSync(fa)) continue;
  const t = fs.readFileSync(fa, 'utf8');
  const hit = PARTS.filter((p) => t.includes(p));
  if (hit.length) console.log(`  ${n.padEnd(6)} ${hit.join('、')}`);
}
console.log('  (以上为全部命中；未列出者 0 处)');
