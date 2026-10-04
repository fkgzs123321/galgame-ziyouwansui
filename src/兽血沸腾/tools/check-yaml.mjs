import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const root = 'C:/tavern_helper_template/src/兽血沸腾';
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.yaml')) files.push(p);
  }
})(path.join(root, '世界书'));

let bad = 0, skipped = 0, ok = 0;
for (const p of files) {
  const t = fs.readFileSync(p, 'utf8');
  if (t.includes('<%_') || t.includes('@@')) { skipped++; console.log('SKIP(EJS) ' + path.relative(root, p)); continue; }
  try {
    YAML.parse(t);
    ok++;
  } catch (e) {
    bad++;
    console.log('FAIL ' + path.relative(root, p) + '\n   ' + String(e.message).split('\n')[0]);
  }
}
console.log(`\nfiles=${files.length} ok=${ok} skipEJS=${skipped} fail=${bad}`);
