// 私密档案流水线总账：逐角色列出文件、体积、结构合规性，并汇总缺口。
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const DIR = 'src/兽血沸腾/世界书/角色';

// 名册（与 tools/reg-nsfw.mjs 的 ROSTER 同源，此处按合并裁定后的最终目标名册）
const ROSTER = [
  '凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝', '贞德', '白素青',
  '谭雅', '阿仙奴', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕',
];

const 通用件 = ['身量', '奶子', '奶头', '乳晕', '逼', '阴蒂', '屁眼', '腰腹', '臀部', '腿', '足', '手', '口舌', '腋下', '发肤', '标志'];
const 必节 = ['外观', '气味', '分泌物', '敏感带', '名器', '性癖'];

const pad = (s, n) => String(s) + ' '.repeat(Math.max(0, n - String(s).replace(/[\u4e00-\u9fff]/g, 'xx').length));

console.log('角色'.padEnd(16) + '私密.yaml'.padEnd(14) + '私密阶段.yaml'.padEnd(16) + '合计'.padEnd(10) + '结构');
console.log('─'.repeat(96));

let 全齐 = 0;
const 缺 = [];

for (const n of ROSTER) {
  const d = path.join(DIR, n);
  const a = path.join(d, '私密.yaml');
  const b = path.join(d, '私密阶段.yaml');
  const hasA = fs.existsSync(a);
  const hasB = fs.existsSync(b);
  const sa = hasA ? fs.statSync(a).size : 0;
  const sb = hasB ? fs.statSync(b).size : 0;

  let 结构 = [];
  if (hasA) {
    const t = fs.readFileSync(a, 'utf8');
    let d2 = null;
    try {
      d2 = yaml.parse(t);
    } catch (e) {
      结构.push('YAML错:' + String(e.message).slice(0, 24));
    }
    if (d2) {
      const miss节 = 必节.filter(k => !(k in d2));
      if (miss节.length) 结构.push('缺节' + miss节.join('/'));
      const miss件 = 通用件.filter(k => !(k in (d2.外观 || {})));
      if (miss件.length) 结构.push('缺件' + miss件.join('/'));
    }
    if (t.includes('@@')) 结构.push('私密含@@');
    if (/<[a-zA-Z/]/.test(t)) 结构.push('私密含XML');
  } else 结构.push('缺私密');

  if (hasB) {
    const t = fs.readFileSync(b, 'utf8');
    const l1 = t.split('\n')[0].trim();
    if (l1 !== '@@private') 结构.push('阶段首行=' + l1.slice(0, 14));
    const cnt = (t.match(/@@/g) || []).length;
    if (cnt !== 1) 结构.push('@@数=' + cnt);
    const l2 = t.split('\n')[1] || '';
    if (!/getvar\(/.test(l2)) 结构.push('L2无getvar');
    else if (!/stat_data\./.test(l2)) 结构.push('L2缺stat_data');
  } else 结构.push('缺阶段');

  if (hasA && hasB) 全齐++;
  else 缺.push(n + (hasA ? '' : ' 无私密') + (hasB ? '' : ' 无阶段'));

  console.log(
    n.padEnd(16) +
      (hasA ? sa + ' B' : '—').padEnd(14) +
      (hasB ? sb + ' B' : '—').padEnd(16) +
      (hasA && hasB ? sa + sb + ' B' : '—').padEnd(10) +
      (结构.length ? '✗ ' + 结构.join(' ') : '✓'),
  );
}

console.log('\n════ 汇总 ════');
console.log(`名册 ${ROSTER.length} 人；两件齐全 ${全齐} 人`);
if (缺.length) console.log('未齐: ' + 缺.join(' | '));

// 目录里存在但不在名册中的角色
const dirs = fs
  .readdirSync(DIR, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name);
const 多余 = dirs.filter(d => !ROSTER.includes(d));
console.log('\n名册外角色目录（应为男性/配角/未成年）:');
console.log('  ' + 多余.join('、'));
