import fs from 'fs';
import YAML from 'yaml';

const o = YAML.parse(fs.readFileSync('src/兽血沸腾/故事大纲.yaml', 'utf8'));
const items = o.items ?? [];
console.log(`items 总数: ${items.length}`);
console.log(`样本 3 条:`);
for (const it of items.slice(0, 3)) console.log('  ' + JSON.stringify(it));

// 名称分布：哪些是装备/物品，哪些是概念
const names = items.map(i => i.名称 ?? i.name ?? JSON.stringify(i).slice(0, 30));
const uniq = [...new Set(names)];
console.log(`\n唯一名称: ${uniq.length}`);
console.log(`前 60 个:`);
console.log('  ' + uniq.slice(0, 60).join('、'));

// 检查这些名称在成品世界书里的覆盖情况
const all = [];
const walk = (d) => {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = `${d}/${f.name}`;
    if (f.isDirectory()) walk(p); else if (/\.ya?ml$/.test(f.name)) all.push(fs.readFileSync(p, 'utf8'));
  }
};
walk('src/兽血沸腾/世界书');
const blob = all.join('\n');
const missing = uniq.filter(n => typeof n === 'string' && n.length > 1 && !blob.includes(n));
console.log(`\n成品世界书中查不到的 item 名称: ${missing.length} / ${uniq.length}`);
console.log('  ' + missing.slice(0, 80).join('、'));
