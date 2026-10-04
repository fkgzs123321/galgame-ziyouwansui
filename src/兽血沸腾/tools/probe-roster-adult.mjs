// 逐个核验私密档案名册里每个角色的形体是否成年。
// 两类证据：
//   本卡 基础信息.yaml 里是否出现幼女/小女孩/未成年/稚嫩等标记；
//   原文中该角色名与「成年女体词」vs「幼小词」的共现次数。
// 目的：不再出现第二个「安瑞达」。
import fs from 'fs';
import path from 'path';

const PROJ = 'src/兽血沸腾';
const TXT = path.join(PROJ, '兽血沸腾.txt');

const ROSTER = [
  '凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝', '贞德', '白素青',
  '谭雅', '珊瑚美人', '阿仙奴', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕',
];

const 成年词 = /(酥胸|乳房|胸脯|翘臀|肥臀|臀部|长腿|大腿|身段|曲线|丰满|成熟|乳峰|腰肢|纤腰)/;
const 幼小词 = /(小女孩|幼女|稚嫩|小小的个子| child|未成年|幼小|发育不全|还没发育|丫头片子)/;

const lines = fs.readFileSync(TXT, 'utf8').split('\n');
console.log('角色        基础信息标记                        原文共现(成年/幼小)  判定');
console.log('─'.repeat(96));
const flags = [];

for (const name of ROSTER) {
  const base = path.join(PROJ, '世界书/角色', name, '基础信息.yaml');
  let marks = [];
  if (fs.existsSync(base)) {
    const t = fs.readFileSync(base, 'utf8');
    for (const m of ['小女孩', '幼女', '未成年', '稚嫩', '小小的个子', '少女', '豆蔻'])
      if (t.includes(m)) marks.push(m);
    // 年龄字段
    const age = t.match(/年龄[:：]\s*([^\n]+)/);
    if (age) marks.unshift(`年龄=${age[1].trim()}`);
  } else marks.push('无基础信息');

  let adult = 0, child = 0;
  for (const l of lines) {
    if (!l.includes(name)) continue;
    if (成年词.test(l)) adult++;
    if (幼小词.test(l)) child++;
  }
  const verdict = marks.some(m => /幼女|小女孩|未成年|稚嫩|小小的个子/.test(m))
    ? '✗ 需剔除'
    : (child > 0 && adult === 0 ? '? 复查' : '✓ 成年');
  if (verdict !== '✓ 成年') flags.push(name);
  console.log(
    name.padEnd(11) +
    (marks.join(',') || '（无标记）').padEnd(35) +
    `${String(adult).padStart(4)}/${String(child).padEnd(4)}`.padEnd(20) +
    verdict,
  );
}

console.log('\n需复查:', flags.length ? flags.join('、') : '无');
