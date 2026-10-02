import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
function toFnBody(content) {
  let js = '';
  let last = 0;
  const re = /<%_([\s\S]*?)_%>/g;
  let m;
  while ((m = re.exec(content))) {
    const lit = content.slice(last, m.index);
    js += `__p(${JSON.stringify(lit)});`;
    js += m[1] + ';';
    last = re.lastIndex;
  }
  js += `__p(${JSON.stringify(content.slice(last))});`;
  return js;
}
function scan(root) {
  const bad = [];
  const walk = d => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.yaml')) {
        const c = fs.readFileSync(p, 'utf8');
        if (!/<%_/.test(c)) continue;
        const body = c.replace(/^@@\w+[^\n]*\n/, '');
        try { new Function('__p', '__c', `with(__c){${toFnBody(body)}}`); }
        catch (err) { bad.push({ p: p.split(path.sep).join('/'), msg: String(err.message).slice(0, 100) }); }
      }
    }
  };
  walk(root);
  return bad;
}
const bad = scan(fileURLToPath(new URL('../世界书', import.meta.url)));
console.log('EJS 编译失败条目:', bad.length);
bad.forEach(b => console.log(' ', b.p, '->', b.msg));
