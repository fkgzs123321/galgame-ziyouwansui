import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const root = 'src/兽血沸腾';
const files = [
  '世界书/变量/initvar.yaml',
  '开场白/initvar/2.yaml',
  '开场白/initvar/3.yaml',
  '开场白/initvar/4.yaml',
  '开场白/initvar/5.yaml',
  '开场白/initvar/6.yaml',
];

let fail = 0;
for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) {
    console.log('MISSING', f);
    fail++;
    continue;
  }
  const text = fs.readFileSync(p, 'utf8');
  let data;
  try {
    data = YAML.parse(text);
  } catch (e) {
    console.log('FAIL   ', f, '::', e.message.split('\n')[0]);
    fail++;
    continue;
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    console.log('SCALAR ', f, ':: top is', typeof data);
    fail++;
    continue;
  }
  const top = Object.keys(data);
  const need = ['世界', '剧情', '主角', '技能树', '战斗', '领地', '魔宠', '关系', '后宫', '系统'];
  const miss = need.filter(k => !top.includes(k));
  const extra = top.filter(k => !need.includes(k));
  console.log(
    (miss.length ? 'SHAPE! ' : 'OK     ') + f,
    '| top=' + top.length,
    miss.length ? '| missing=' + miss.join(',') : '',
    extra.length ? '| extra=' + extra.join(',') : '',
    '| 关系=' + Object.keys(data.关系 || {}).length,
    '| 阶位=' + data.主角?.阶位,
    '| 卷=' + data.剧情?.当前卷,
    '| 进度=' + data.剧情?.主线进度,
  );
  if (miss.length) fail++;
}
console.log(fail ? `\n共 ${fail} 个问题` : '\ninitvar 全部通过');
