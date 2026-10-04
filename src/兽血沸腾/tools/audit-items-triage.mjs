import fs from 'fs';
import YAML from 'yaml';

const o = YAML.parse(fs.readFileSync('src/兽血沸腾/故事大纲.yaml', 'utf8'));
const t = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const items = o.items ?? [];
const uniq = [...new Set(items.map(i => i.name))];

const all = [];
const walk = (d) => {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = `${d}/${f.name}`;
    if (f.isDirectory()) walk(p); else if (/\.ya?ml$/.test(f.name)) all.push(fs.readFileSync(p, 'utf8'));
  }
};
walk('src/兽血沸腾/世界书');
const blob = all.join('\n');
const missing = uniq.filter(n => n && n.length > 1 && !blob.includes(n));

// 分类：战歌/魔法体系类（技能树相关，重要） vs 具体器物（道具，次要）
const SONG = /战歌|之歌|战曲|锁链/;
const SYS = /诅咒|结界|魔法|术|禁咒|幻术|体系|机制|天赋|异能|领域|契约|祝福/;
const important = missing.filter(n => SONG.test(n) || SYS.test(n));
const props = missing.filter(n => !SONG.test(n) && !SYS.test(n));

console.log(`══ 未覆盖 item 总数 ${missing.length} ══`);
console.log(`  战歌/体系类（重要，共 ${important.length}）:`);
for (const n of important) console.log(`    ${n.padEnd(26)} 原文命中 ${t.split(n).length - 1}`);
console.log(`\n  具体器物类（共 ${props.length}），原文命中 ≥3 的:`);
const hot = props.filter(n => t.split(n).length - 1 >= 3).sort((a, b) => (t.split(b).length) - (t.split(a).length));
for (const n of hot.slice(0, 40)) console.log(`    ${n.padEnd(26)} ${t.split(n).length - 1}`);
console.log(`\n  具体器物类中原文命中 ≤2 的（多半是一次性道具，可不做条目）: ${props.length - hot.length} 个`);
