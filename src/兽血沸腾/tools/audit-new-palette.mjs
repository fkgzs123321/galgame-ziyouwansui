import fs from 'fs';
import path from 'path';

const DIR = 'src/兽血沸腾/世界书/角色';
const TARGETS = ['黛丝', '若尔娜', '崔蓓茜', '歌坦妮', '果果', '壹条', '安度兰长老', '隆美尔', '李察王子', '茉儿'];

// rules-check.md 禁词
const BANNED = [
  ['破折号', /——/],
  ['绝对零度-陈旧比喻', /似乎|几乎|仿佛|如同|宛如/],
  ['嘴角微微上扬', /嘴角(微微)?(上扬|带[着起])/],
  ['眼中闪过一丝', /眼中闪过(一丝|一抹|一道)/],
  ['带着XX的口吻', /带着.{1,6}的口吻/],
  ['投石入湖/心湖', /投石入湖|心湖泛起|心湖/],
  ['像小兽', /像小兽|象小兽/],
  ['因为', /因为/],
  ['本质上', /本质上/],
  ['其实', /其实/],
  ['内心', /内心/],
  ['ASCII逗号', /[\u4e00-\u9fa5],[\u4e00-\u9fa5]/],
  ['ASCII句号', /[\u4e00-\u9fa5]\.[\u4e00-\u9fa5]/],
  ['ASCII引号', /["']/],
  ['XML标签', /<[a-z_]+>/],
  ['分隔线', /^---$/m],
  ['占位符', /待细化|TODO|XXX|占位/],
  ['万念俱灰', /万念俱灰/],
  ['陷入极大的恐惧', /陷入极大的?恐惧/],
];

console.log('字符  '.padEnd(12) + '大小    行数  问题');
for (const n of TARGETS) {
  const p = path.join(DIR, n, '性格调色盘.yaml');
  if (!fs.existsSync(p)) { console.log(`  ${n.padEnd(10)} 尚未创建`); continue; }
  const c = fs.readFileSync(p, 'utf8');
  const lines = c.split('\n');
  const hits = [];
  for (const [label, re] of BANNED) {
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) hits.push(`${label}@L${i + 1}`);
    }
  }
  const ejs = lines[0].startsWith('@@') ? '@@' : '—';
  console.log(`  ${n.padEnd(10)} ${String(fs.statSync(p).size).padStart(6)}B ${String(lines.length).padStart(4)}行  首行${ejs}  ${hits.length ? hits.join(' ') : 'OK'}`);
}
