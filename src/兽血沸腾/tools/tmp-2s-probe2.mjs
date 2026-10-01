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

const mode = process.argv[2];
const terms = process.argv.slice(3);

if (mode === 'all') {
  for (const t of terms) {
    console.log('== ' + t);
    let n = 0;
    for (let i = 0; i < txt.length; i++) {
      if (txt[i].includes(t)) {
        n++;
        console.log('  idx=' + idx(i + 1) + ' L' + (i + 1) + ' | ' + txt[i].trim().slice(0, 175));
      }
    }
    if (!n) console.log('  (none)');
  }
} else if (mode === 'co') {
  console.log('== co(' + terms[0] + ', ' + terms[1] + ')');
  let n = 0;
  for (let i = 0; i < txt.length; i++) {
    if (txt[i].includes(terms[0]) && txt[i].includes(terms[1])) {
      n++;
      console.log('  idx=' + idx(i + 1) + ' L' + (i + 1) + ' | ' + txt[i].trim().slice(0, 175));
    }
  }
  if (!n) console.log('  (none)');
} else if (mode === 'range') {
  const a = Number(terms[0]);
  const b = Number(terms[1]);
  for (let i = 0; i < txt.length; i++) {
    const k = idx(i + 1);
    if (k >= a && k <= b) {
      const s = txt[i].trim();
      if (s) console.log('idx=' + k + ' L' + (i + 1) + ' | ' + s.slice(0, 240));
    }
  }
}
