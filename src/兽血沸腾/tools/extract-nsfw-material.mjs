import fs from 'fs';
import path from 'path';

const TXT = 'src/兽血沸腾/兽血沸腾.txt';
const lines = fs.readFileSync(TXT, 'utf8').split('\n');

const ROSTER = ['凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝', '贞德', '白素青',
  '谭雅', '珊瑚美人', '阿仙奴', '安瑞达', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕'];

// 别名
const ALIAS = {
  '凝玉': ['凝玉', '蚌女', '蚌人', '老蚌怀珠'],
  '艾薇尔': ['艾薇尔', '艾薇儿', '美人鱼公主', '西雅'],
  '崔蓓茜': ['崔蓓茜', '崔蓓西', '妮可', '美女蛇'],
  '歌坦妮': ['歌坦妮', '天鹅女骑士'],
  '若尔娜': ['若尔娜', '老板娘'],
  '黛丝': ['黛丝'],
  '贞德': ['贞德', '契女'],
  '白素青': ['白素青', '素青'],
  '谭雅': ['谭雅', '娜娜'],
  '珊瑚美人': ['珊瑚美人'],
  '阿仙奴': ['阿仙奴'],
  '安瑞达': ['安瑞达', '鸩女'],
  '许德拉': ['许德拉', '九头蛇'],
  '歌莉妮': ['歌莉妮'],
  '唐蓓尔金娜': ['唐蓓尔金娜', '冰凰'],
  '梦露': ['梦露'],
  '嘉宝': ['嘉宝'],
  '艾莉婕': ['艾莉婕'],
};

// 身体/性关键词（决定"这条素材与私密档案有关"）
const BODY = /(奶子|乳房|胸部|胸脯|乳晕|乳头|奶头|屁股|臀部|臀|大腿|小腿|腿|脚|足|腰|腹|肚脐|背|肩|脖子|颈|锁骨|头发|长发|皮肤|肌肤|脸|眼|睫毛|唇|嘴|舌|手|指|腋|体香|气味|味道|香味|骚|淫|湿|水|汁|液|黏|腥|酸|汗|裸|赤身|一丝不挂|脱|胸罩|内裤|亵裤|睡衣|长袍|裙|丝袜|鞋|逼|屄|穴|阴道|阴唇|阴蒂|阴阜|宫颈|子宫|屁眼|肛门|后穴|菊|处子|处女|初夜|破处|名器|春药|发情|动情|情欲|欲望|高潮|呻吟|娇喘|喘|叫床|床|上床|睡觉|洞房|圆房|侍寝|同房|亲|吻|摸|抚|揉|捏|抱|搂|压|舔|含|吸|吮|咬|插|捅|肏|干|操|射|精|怀孕|孕|生子|生育|分娩|临产|产下|奶水|哺乳|喂奶|指婚|成婚|完婚|妻子|老婆|夫人|娇妻|爱妾|侍妾)/;

const outDir = 'src/兽血沸腾/tools/nsfw-material';
fs.mkdirSync(outDir, { recursive: true });

const summary = [];
for (const name of ROSTER) {
  const aliases = ALIAS[name] || [name];
  const re = new RegExp(aliases.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));
  const hits = [];
  lines.forEach((l, i) => {
    if (re.test(l) && BODY.test(l)) {
      hits.push({ n: i + 1, l: l.trim() });
    }
  });
  // 按行号排序，去重相邻重复
  const dedup = [];
  for (const h of hits) {
    if (dedup.length && dedup[dedup.length - 1].l === h.l) continue;
    dedup.push(h);
  }
  const chunk = dedup.map(h => `L${h.n}: ${h.l}`).join('\n');
  fs.writeFileSync(path.join(outDir, `${name}.txt`), chunk, 'utf8');
  summary.push({ name, hits: dedup.length, bytes: Buffer.byteLength(chunk, 'utf8') });
}

console.log('角色'.padEnd(14) + '命中行'.padEnd(8) + '素材字节');
console.log('─'.repeat(40));
let tot = 0;
for (const s of summary.sort((a, b) => b.hits - a.hits)) {
  console.log(`${s.name.padEnd(12)} ${String(s.hits).padEnd(8)} ${s.bytes}`);
  tot += s.bytes;
}
console.log('─'.repeat(40));
console.log(`合计 ${tot} 字节 → ${outDir}/`);

// 种类解剖学（非人名绑定）
console.log('\n══ 种族解剖关键词总量 ══');
const t = fs.readFileSync(TXT, 'utf8');
for (const w of ['蚌壳', '美人鱼', '蛇尾', '蛇发', '美杜莎', '天鹅翅膀', '翅膀', '龙鳞', '仙女龙',
  '内裤', '胸罩', '亵裤', '肚兜', '名器', '春药', '闷骚', '骚逼', '奶子', '屁眼', '乳晕']) {
  console.log(`  ${w}: ${(t.match(new RegExp(w, 'g')) || []).length}`);
}
