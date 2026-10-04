import fs from 'fs';
import path from 'path';

const SKIP = /wip|dist|\.patch-history|node_modules|兽血沸腾\.txt|兽血沸腾\.json|tools/;
const hits = [];
(function w(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!SKIP.test(e.name + '/')) w(p); }
    else if (/\.(ya?ml|md|ts|vue)$/.test(e.name)) {
      fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        if (/待细化|待补|TODO|FIXME|XXX|占位|待定|待写|待填/.test(l)) {
          hits.push(`  ${path.relative('src/兽血沸腾', p)}:${i + 1}  ${l.trim().slice(0, 120)}`);
        }
      });
    }
  }
})('src/兽血沸腾');
console.log(`══ 占位符/待细化 命中 ${hits.length} 处 ══`);
hits.forEach(h => console.log(h));
