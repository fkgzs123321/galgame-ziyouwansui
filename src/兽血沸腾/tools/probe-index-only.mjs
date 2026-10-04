import fs from 'fs';
import path from 'path';
const ROOT = 'src/兽血沸腾';
const txt = fs.readFileSync(`${ROOT}/兽血沸腾.txt`, 'utf8');
const ol = fs.readFileSync(`${ROOT}/故事大纲.yaml`, 'utf8');

const onlyCat = ['古德','罗德曼','维埃里','贝拉米','科里纳','奥尼尔','潘帅','贝克汉姆','菲高','贝肯鲍尔','普斯卡什大师','唐藏亲王（冬五）'];
const base = n => n.replace(/（.*?）|\(.*?\)/g, '').replace(/大师|亲王/g, '').trim();

// 事件条目文本
let evText = '';
for (const f of fs.readdirSync(path.join(ROOT, '世界书/事件'))) evText += fs.readFileSync(path.join(ROOT, '世界书/事件', f), 'utf8');
// 地理/时间线/世界观 文本
let otherText = '';
for (const d of ['地理', '时间线', '世界观']) {
  const walk = p => { for (const e of fs.readdirSync(p, { withFileTypes: true })) { const q = path.join(p, e.name); if (e.isDirectory()) walk(q); else if (q.endsWith('.yaml')) otherText += fs.readFileSync(q, 'utf8'); } };
  walk(path.join(ROOT, '世界书', d));
}

console.log('姓名'.padEnd(16) + '原文命中'.padEnd(10) + '事件条目'.padEnd(10) + '其它条目'.padEnd(10) + '大纲提及');
console.log('─'.repeat(70));
for (const n of onlyCat) {
  const b = base(n);
  const c = (txt.match(new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const e = evText.includes(b) ? '✓' : '✗';
  const o = otherText.includes(b) ? '✓' : '✗';
  const g = ol.includes(b) ? '✓' : '✗';
  console.log(n.padEnd(16) + String(c).padEnd(10) + e.padEnd(12) + o.padEnd(12) + g);
}
