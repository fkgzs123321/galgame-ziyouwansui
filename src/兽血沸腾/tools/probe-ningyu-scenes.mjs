import fs from 'fs';
const lines = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n');

const HARD = /(奶子|乳房|乳头|奶头|乳晕|酥胸|胸脯|阴唇|阴蒂|阴阜|阴道|宫颈|子宫|屁眼|肛门|后穴|屄|逼|骚穴|肉穴|名器|处子|处女|初夜|破处|落红|春药|媚药|发情|动情|春情|情欲|高潮|呻吟|娇喘|叫床|浪叫|圆房|洞房|侍寝|同房|承欢|赤身|一丝不挂|脱光|扒光|亵裤|肚兜|舔|含住|吮吸|插入|捅进|肏|精液|射了|淫水|贞洁|失身|手淫|自慰|指交|口交|媚态|妖娆|娇媚|风骚)/;

const probe = (name, alts) => {
  const alias = new RegExp(`(${[name, ...alts].join('|')})`);
  const out = [];
  lines.forEach((l, i) => {
    if (alias.test(l) && HARD.test(l)) out.push([i + 1, l.trim()]);
  });
  console.log(`\n${'═'.repeat(76)}\n══ ${name} 强信号 ${out.length} 行 ══`);
  for (const [n, l] of out) console.log(`L${n}: ${l.slice(0, 300)}`);
};

probe('凝玉', ['蚌女', '凝玉小姐']);
