import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync('src/兽血沸腾/兽血沸腾.json', 'utf8'));
const out = [];
const f = (x) => {
  if (Array.isArray(x)) return x.forEach(f);
  if (x && typeof x === 'object') {
    if (typeof x.content === 'string' && x.content.includes('character_basic character="艾弗森"')) out.push(x.content);
    for (const v of Object.values(x)) f(v);
  }
};
f(j);
console.log('hits', out.length);
for (const c of out) console.log(c);
