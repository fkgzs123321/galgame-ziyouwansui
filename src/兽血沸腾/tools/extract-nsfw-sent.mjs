import fs from 'fs';
import path from 'path';

const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');

const ROSTER = {
  '凝玉': ['凝玉', '蚌女', '蚌人'],
  '艾薇尔': ['艾薇尔', '艾薇儿', '美人鱼公主'],
  '崔蓓茜': ['崔蓓茜', '崔蓓西', '妮可', '美女蛇'],
  '歌坦妮': ['歌坦妮'],
  '若尔娜': ['若尔娜'],
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

// 解剖/性行为词 —— 只留真正与私密档案有关的
const ANAT = /(奶子|乳房|乳头|奶头|乳晕|胸脯|酥胸|胸罩|屁股|臀部|臀肉|翘臀|大腿|腿根|小腿|脚趾|脚掌|脚跟|脚踝|玉足|肚脐|小腹|腰肢|纤腰|蛇腰|脖颈|锁骨|香肩|胳肢窝|腋|头发|长发|肌肤|皮肤|脸蛋|睫毛|嘴唇|舌尖|手指|指甲)/;
const SEX = /(逼|屄|骚穴|肉穴|阴道|阴唇|阴蒂|阴阜|宫颈|子宫|屁眼|肛门|后穴|名器|处子|处女|初夜|破处|开苞|春药|媚药|发情|动情|春情|情欲|性欲|肉欲|高潮|呻吟|娇喘|叫床|浪叫|上床|洞房|圆房|侍寝|同房|承欢|裸|赤身|一丝不挂|脱光|扒光|精光|亵裤|内裤|肚兜|舔|含住|吸吮|吮吸|舔弄|插入|捅进|肏|操|干|精液|射|怀孕|有孕|分娩|临产|奶水|哺乳|喂奶|初夜权|淫水|湿透|夹紧|喘息|贞洁|失身|揉搓|手淫|自慰|指交|口交|媚态|妖娆|娇媚|风骚|骚|淫|艳)/;
const SMELL = /(体香|气味|香味|味道|香气|幽香|腥|骚味|汗味|奶香)/;

const outDir = 'src/兽血沸腾/tools/nsfw-material';
fs.mkdirSync(outDir, { recursive: true });

const report = [];
for (const [name, aliases] of Object.entries(ROSTER)) {
  const re = new RegExp(aliases.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));
  const keep = new Set();
  let sentHits = 0;
  lines.forEach((l, i) => {
    if (!re.test(l)) return;
    // 拆句，要求人名与信号词同句
    const sents = l.split(/(?<=[。！？；])/);
    for (const s of sents) {
      if (!re.test(s)) continue;
      if ((ANAT.test(s) || SEX.test(s) || SMELL.test(s)) && s.length > 8) { sentHits++; keep.add(i); break; }
    }
  });
  const idx = [...keep].sort((a, b) => a - b);
  const chunks = [];
  let cur = null;
  for (const i of idx) {
    if (cur && i <= cur.end + 3) cur.end = i;
    else { cur = { start: i, end: i }; chunks.push(cur); }
  }
  const out = [];
  let bytes = 0;
  for (const c of chunks) {
    const seg = [];
    for (let i = c.start; i <= c.end; i++) {
      const s = lines[i].trim();
      if (s) seg.push(`L${i + 1}: ${s}`);
    }
    if (!seg.length) continue;
    const t = `\n── L${c.start + 1}~${c.end + 1} ──\n` + seg.join('\n');
    if (bytes + t.length > 120000) break;
    out.push(t); bytes += t.length;
  }
  const body = `### ${name} 私密素材（同句共现，命中 ${sentHits} 句 / ${idx.length} 行 / ${chunks.length} 段${out.length < chunks.length ? `，收录前 ${out.length} 段` : ''}）\n` + out.join('\n');
  fs.writeFileSync(path.join(outDir, `${name}.素材.txt`), body, 'utf8');
  report.push({ name, sentHits, idx: idx.length, chunks: chunks.length, kept: out.length, kb: (Buffer.byteLength(body, 'utf8') / 1024).toFixed(0) });
}

console.log('角色'.padEnd(14) + '句'.padEnd(7) + '行'.padEnd(7) + '段'.padEnd(7) + '收录'.padEnd(7) + 'KB');
console.log('─'.repeat(50));
for (const r of report.sort((a, b) => b.sentHits - a.sentHits)) {
  console.log(`${r.name.padEnd(12)} ${String(r.sentHits).padEnd(6)} ${String(r.idx).padEnd(6)} ${String(r.chunks).padEnd(6)} ${String(r.kept).padEnd(6)} ${r.kb}`);
}
