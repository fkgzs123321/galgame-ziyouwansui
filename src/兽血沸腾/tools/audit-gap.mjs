import fs from 'fs';
import YAML from 'yaml';
import path from 'path';

const ROOT = 'src/兽血沸腾';
const NEED = ['黛丝', '若尔娜', '崔蓓茜', '歌坦妮', '果果', '壹条', '安度兰长老', '茉儿'];

// 1) 关系键
const iv = fs.readFileSync(`${ROOT}/世界书/变量/initvar.yaml`, 'utf8');
console.log('══ initvar 关系 段中的键 ══');
const relKeys = [];
let inRel = false;
iv.split('\n').forEach(l => {
  if (/^关系:/.test(l)) { inRel = true; return; }
  if (inRel) {
    if (/^[^\s]/.test(l)) { inRel = false; return; }
    const m = l.match(/^  (\S+?):/);
    if (m) relKeys.push(m[1]);
  }
});
console.log('  ' + relKeys.join('、'));
console.log('\n  待补角色是否已在关系中:');
for (const n of NEED) console.log(`    ${n}: ${relKeys.includes(n) ? '✓' : '✗ 缺'}`);

// 2) 现有性格调色盘条目的形状
console.log('\n══ 现有「性格调色盘」条目的 EJS 形态 ══');
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === '性格调色盘.yaml') {
      const c = fs.readFileSync(p, 'utf8');
      const hasMulti = /关系\.\S+\.好感度/.test(c);
      const stages = (c.match(/aff </g) ?? []).length;
      console.log(`  ${path.relative(ROOT, p).padEnd(42)} 多阶段=${hasMulti ? 'Y' : 'N'}  阈值数=${stages}  ${c.length}B`);
    }
  }
})(`${ROOT}/世界书/角色`);

// 3) 待补角色的素材量
console.log('\n══ 8 人在原文中的出现次数 ══');
const txt = fs.readFileSync(`${ROOT}/兽血沸腾.txt`, 'utf8');
for (const n of NEED) console.log(`  ${n.padEnd(8)} ${txt.split(n).length - 1}`);

// 4) 故事大纲中的人物档案
const outline = YAML.parse(fs.readFileSync(`${ROOT}/故事大纲.yaml`, 'utf8'));
console.log('\n══ 故事大纲 characters 中的档案 ══');
for (const c of outline.characters ?? []) {
  const nm = c.name ?? '';
  for (const n of NEED) {
    if (nm === n || nm.includes(n)) {
      console.log(`  ${nm}  字段: ${Object.keys(c).join(',')}  引文 ${(c.quotes ?? []).length} 条`);
    }
  }
}
