import fs from 'node:fs';

const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8').split('\n').map(l => l.replace(/\r$/, ''));
const ci = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/chapter-index.json', 'utf8'));
function idx(l) {
  let r = 0;
  for (const c of ci) {
    if (c.line <= l) r = c.idx;
    else break;
  }
  return r;
}

function stat(term, opts = {}) {
  const withTerm = [];
  for (let i = 0; i < txt.length; i++) {
    const s = txt[i];
    if (!s.includes(term)) continue;
    if (opts.co && !s.includes(opts.co)) continue;
    withTerm.push(i + 1);
  }
  const out = { term, co: opts.co || '-', n: withTerm.length };
  if (withTerm.length) {
    out.firstIdx = idx(withTerm[0]);
    out.firstLine = withTerm[0];
    out.sample = txt[withTerm[0] - 1].trim().slice(0, 190);
  }
  return out;
}

const terms = process.argv.slice(2);
for (const t of terms) {
  console.log(JSON.stringify(stat(t), null, 0));
}
if (process.argv.includes('--co')) {
  for (const t of terms) {
    if (t === '--co') continue;
    console.log(JSON.stringify(stat(t, { co: '二少' }), null, 0));
  }
}
