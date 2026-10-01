import fs from 'fs';
import path from 'path';

const ROOT = 'src/兽血沸腾/世界书/角色';
const TXT = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const LINES = TXT.split('\n');

const dirs = fs.readdirSync(ROOT, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
const IGNORE = new Set(['他', '她', '它', '的', '了', '是']);

// 递归取「名字附近」的代词：名字出现处前后 60 字内的 她/他
function pronounScore(key) {
  let she = 0, he = 0;
  for (const line of LINES) {
    let idx = line.indexOf(key);
    while (idx !== -1) {
      const win = line.slice(Math.max(0, idx - 60), idx + key.length + 60);
      she += (win.match(/她/g) || []).length;
      he += (win.match(/他/g) || []).length - (win.match(/其他|他们/g) || []).length;
      idx = line.indexOf(key, idx + 1);
    }
  }
  return { she, he };
}

// 从基础信息里抓性别
const pick = (txt, keys) => {
  for (const k of keys) {
    const m = txt.match(new RegExp('^\\s{2}' + k + '[:：]\\s*(.+)$', 'm'));
    if (m) return m[1].trim();
  }
  return '';
};

console.log('姓名'.padEnd(13) + '标注性别'.padEnd(10) + '她'.padStart(5) + '他'.padStart(6) + '   判定');
console.log('─'.repeat(90));
const verdict = {};
for (const d of dirs) {
  const p = path.join(ROOT, d, '基础信息.yaml');
  if (!fs.existsSync(p)) continue;
  const t = fs.readFileSync(p, 'utf8');
  const sex = pick(t, ['性别']);
  const key = d.replace(/\..*$/, '');
  const { she, he } = pronounScore(key);
  let v;
  if (/女|母|雌/.test(sex)) v = '女';
  else if (/男|公|雄/.test(sex)) v = '男';
  else v = she > he * 1.5 ? '女?' : he > she * 1.5 ? '男?' : '??';
  verdict[d] = { sex, she, he, v };
  const mark = v.startsWith('女') ? '♀' : v.startsWith('男') ? '♂' : '?';
  console.log(`${mark} ${d.padEnd(12)}${(sex || '—').slice(0, 8).padEnd(10)}${String(she).padStart(5)}${String(he).padStart(6)}   ${v}`);
}

const fem = Object.entries(verdict).filter(([, x]) => x.v.startsWith('女')).map(([k]) => k);
console.log('\n══ 判定为女性 ' + fem.length + ' 人 ══');
console.log('  ' + fem.join('、'));
console.log('\n══ 需人工确认 ══');
Object.entries(verdict).filter(([, x]) => x.v === '??').forEach(([k, x]) => console.log(`  ${k}  她${x.she} 他${x.he}`));
