// 只读探针：核对 16 份 私密.yaml 的 外观: 块是否写全 15 个部位键。
import fs from 'fs';
import path from 'path';

const R = 'src/兽血沸腾/世界书/角色';
const ROSTER = [
  '凝玉','艾薇尔','崔蓓茜','歌坦妮','若尔娜','黛丝','贞德','白素青','谭雅',
  '阿仙奴','许德拉','歌莉妮','唐蓓尔金娜','梦露','嘉宝','艾莉婕',
];
const 原装 = ['奶子','奶头','乳晕','逼','阴唇','阴蒂','屁眼','腰','臀','腿','足','手','口','腋','发'];
const 异名 = {
  阴唇: ['阴唇'], 腰: ['腰腹', '腰'], 臀: ['臀部', '臀'],
  口: ['口舌', '口'], 腋: ['腋下', '腋'], 发: ['发肤', '发'],
};
const 可接受额外 = new Set(['标志', '身量', '蚌壳', '鳞', '尾', '角', '龙珠', '壳']);

let bad = 0;
for (const n of ROSTER) {
  const p = path.join(R, n, '私密.yaml');
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  // 找到 "外观:" 这一行，取其后所有 2 空格键
  const start = lines.findIndex(l => /^外观:\s*$/.test(l));
  if (start < 0) {
    console.log(`✗ ${n.padEnd(8)} 无「外观:」块`);
    bad++;
    continue;
  }
  const keys = new Set();
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^\S/.test(l) && l.trim()) break; // 遇到下一个顶层键
    const m = l.match(/^ {2}([^\s:#][^:]*):/);
    if (m) keys.add(m[1].trim().replace(/^['"]|['"]$/g, ''));
  }
  const miss = [];
  for (const part of 原装) {
    const 候选 = 异名[part] || [part];
    if (!候选.some(c => keys.has(c))) miss.push(part);
  }
  const 多余 = [...keys].filter(k => !原装.some(p2 => (异名[p2] || [p2]).includes(k)));
  const 意外 = 多余.filter(k => !可接受额外.has(k));
  const ok = miss.length === 0;
  if (!ok) bad++;
  console.log(
    `${ok ? '✓' : '✗'} ${n.padEnd(8)} 部位键=${String(keys.size).padStart(2)}` +
      (miss.length ? `  缺: ${miss.join('、')}` : '') +
      (多余.length ? `  附加: ${多余.join('、')}` : '') +
      (意外.length ? `  ⚠意外: ${意外.join('、')}` : ''),
  );
}
console.log(`\n${ROSTER.length - bad}/${ROSTER.length} 份 15 部位齐全`);
