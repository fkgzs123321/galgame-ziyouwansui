// 19 个「纪」文件把「远古正史」与「当代剧情」混在一份文件里。
// 正史可常驻；当代剧情段落必须加守卫。这里逐个顶层节点判定并给出加守卫方案。
import fs from 'fs';
import path from 'path';
const ROOT = 'src/兽血沸腾/世界书/时间线';

// 当代剧情标志：主角名、后期人物、结局串
const CONTEMP = /刘震撼|李察|格拉苏|海伦|凝玉|艾薇尔|崔蓓茜|歌坦妮|若尔娜|黛丝|贞德|白素青|谭雅|阿仙奴|许德拉|歌莉妮|唐蓓尔金娜|梦露|嘉宝|艾莉婕|翡冷翠|介丘|时空大裂缝|奇奥|巫妖王|血婴|小空/;
const ANCIENT = /远古|上古|太古|约一万年前|一万年前|千年前|神魔大战|海加尔战役|创世|泰坦|俄狄斯|古神|第一纪|第二纪|史前/;

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.yaml'))
  .filter(f => !fs.readFileSync(path.join(ROOT, f), 'utf8').startsWith('@@'));

const report = [];
for (const f of files) {
  const ls = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
  // 顶层节点：顶格且以 : 结尾
  const nodes = [];
  ls.forEach((l, i) => { if (/^[^\s#].*:\s*$/.test(l)) nodes.push({ name: l.trim().replace(/:$/, ''), i }); });
  nodes.forEach((n, k) => {
    const end = k + 1 < nodes.length ? nodes[k + 1].i : ls.length;
    const body = ls.slice(n.i + 1, end).join('\n');
    const t = (body.match(/^\s*时间:\s*(.+)$/m) || [])[1] ?? '';
    const contemp = CONTEMP.test(body);
    const ancient = ANCIENT.test(body) || ANCIENT.test(t);
    // 判定：远古标题/时间 且 无当代人物 → 正史
    let verdict;
    if (ancient && !contemp) verdict = '正史';
    else if (contemp) verdict = '当代';
    else verdict = '存疑';
    n.verdict = verdict; n.time = t; n.len = body.length;
  });
  report.push({ f, nodes });
}

let totA = 0, totC = 0, totQ = 0;
for (const { f, nodes } of report) {
  const a = nodes.filter(n => n.verdict === '正史').length;
  const c = nodes.filter(n => n.verdict === '当代').length;
  const q = nodes.filter(n => n.verdict === '存疑').length;
  totA += a; totC += c; totQ += q;
  console.log(`【${f.replace('.yaml', '')}】共 ${nodes.length} 节点  正史 ${a} / 当代 ${c} / 存疑 ${q}`);
  for (const n of nodes) {
    const mark = n.verdict === '当代' ? '⚠当代' : n.verdict === '存疑' ? '?存疑' : ' 正史';
    console.log(`    ${mark}  ${n.name.padEnd(22)} 时间=${n.time.slice(0, 20)}  ${n.len}B`);
  }
}
console.log(`\n合计 正史 ${totA} / 当代 ${totC} / 存疑 ${totQ}`);
