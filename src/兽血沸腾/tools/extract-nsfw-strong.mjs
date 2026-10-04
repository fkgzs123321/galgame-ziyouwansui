import fs from 'fs';
import path from 'path';

const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');

const ROSTER = {
  '凝玉': ['凝玉', '蚌女', '蚌人'],
  '艾薇尔': ['艾薇尔', '艾薇儿', '美人鱼公主'],
  '崔蓓茜': ['崔蓓茜', '崔蓓西', '妮可', '美女蛇'],
  '歌坦妮': ['歌坦妮', '天鹅女骑士'],
  '若尔娜': ['若尔娜', '老板娘'],
  '黛丝': ['黛丝'],
  '贞德': ['贞德'],
  '白素青': ['白素青'],
  '谭雅': ['谭雅'],
  '珊瑚美人': ['珊瑚美人'],
  '阿仙奴': ['阿仙奴'],
  '安瑞达': ['安瑞达', '鸩女'],
  '许德拉': ['许德拉'],
  '歌莉妮': ['歌莉妮'],
  '唐蓓尔金娜': ['唐蓓尔金娜', '冰凰'],
  '梦露': ['梦露'],
  '嘉宝': ['嘉宝'],
  '艾莉婕': ['艾莉婕'],
};

// 强信号：明确的解剖 / 性行为 / 生殖词
const STRONG = /(奶子|乳房|乳头|奶头|乳晕|胸脯|酥胸|屁股|臀部|臀肉|大腿|小腿|脚趾|脚掌|脚跟|肚脐|逼|屄|骚穴|肉穴|阴道|阴唇|阴蒂|阴阜|宫颈|子宫|屁眼|肛门|后穴|名器|处子|处女|初夜|破处|春药|发情|动情|情欲|高潮|呻吟|娇喘|叫床|上床|洞房|圆房|侍寝|同房|裸|赤身|一丝不挂|脱光|胸罩|内裤|亵裤|肚兜|舔|含住|吸吮|吮|舔弄|插入|捅进|肏|精液|怀孕|分娩|临产|奶水|哺乳|初夜权|肉感|肌肤|体香|骚|淫水|湿透|夹紧|喘息|乳|臀|腰肢|腿根|私处|下体|贞洁|失身|扒光|揉搓|手淫|自慰)/;

const outDir = 'src/兽血沸腾/tools/nsfw-material';
fs.mkdirSync(outDir, { recursive: true });

const report = [];
for (const [name, aliases] of Object.entries(ROSTER)) {
  const re = new RegExp(aliases.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));
  const keep = new Set();
  lines.forEach((l, i) => {
    if (re.test(l) && STRONG.test(l)) {
      for (let d = -1; d <= 1; d++) { const j = i + d; if (j >= 0 && j < lines.length) keep.add(j); }
    }
  });
  const idx = [...keep].sort((a, b) => a - b);
  // 合并为连续块
  const chunks = [];
  let cur = null;
  for (const i of idx) {
    if (cur && i === cur.end + 1) cur.end = i;
    else { cur = { start: i, end: i }; chunks.push(cur); }
  }
  // 截到 ~100KB
  const out = [];
  let bytes = 0;
  for (const c of chunks) {
    const seg = [];
    for (let i = c.start; i <= c.end; i++) seg.push(`L${i + 1}: ${lines[i].trim()}`);
    const s = `\n───── L${c.start + 1}~${c.end + 1} ─────\n` + seg.join('\n');
    if (bytes + s.length > 110000) break;
    out.push(s);
    bytes += s.length;
  }
  const body = `### ${name} 私密素材（强信号摘录，共 ${chunks.length} 段，收录 ${out.length} 段）\n` + out.join('\n');
  fs.writeFileSync(path.join(outDir, `${name}.强信号.txt`), body, 'utf8');
  report.push({ name, chunks: chunks.length, kept: out.length, kb: (Buffer.byteLength(body, 'utf8') / 1024).toFixed(0) });
}

console.log('角色'.padEnd(14) + '总段'.padEnd(8) + '收录'.padEnd(8) + 'KB');
console.log('─'.repeat(42));
for (const r of report.sort((a, b) => b.kb - a.kb)) {
  console.log(`${r.name.padEnd(12)} ${String(r.chunks).padEnd(8)} ${String(r.kept).padEnd(8)} ${r.kb}`);
}
