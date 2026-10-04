// 只读探针：确认卡内条目结构，并找出 4 个被篡改档位的原始基础信息。
import fs from 'fs';

const 卡 = JSON.parse(fs.readFileSync('src/兽血沸腾/兽血沸腾.json', 'utf8'));
const b = 卡.data.character_book;
console.log('book keys: ' + Object.keys(b).join(' · '));

const es = b.entries;
const arr = Array.isArray(es) ? es : Object.values(es);
console.log('entries: ' + arr.length + (Array.isArray(es) ? ' (array)' : ' (object)'));
console.log('entry[0] keys: ' + Object.keys(arr[0]).join(' · '));
console.log('entry[0].comment: ' + JSON.stringify(arr[0].comment));
console.log('entry[0] content head: ' + JSON.stringify(String(arr[0].content || '').slice(0, 60)));
console.log('entry[0].name: ' + JSON.stringify(arr[0].name));

const 目标 = ['海伦.列娜', '茉儿', '茜茜', '姬丝凯碧'];
console.log('\n══ 卡内匹配条目（打包于 06:16，早于篡改）══');
for (const e of arr) {
  const c = String(e.comment ?? e.name ?? '');
  if (目标.some(t => c.includes(t))) {
    const 内 = String(e.content || '');
    const m = 内.match(/^\s*年龄:.*$/m);
    console.log(`   ${c.padEnd(30)} ${String(内.length).padStart(5)} B   ${m ? m[0].trim() : '(无年龄字段)'}`);
  }
}

// state 注册情况
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const 角 = st.entryManifest.角色;
const 私 = Object.keys(角).filter(k => /私密/.test(k));
console.log(`\n══ state 角色条目共 ${Object.keys(角).length} 个，含「私密」的 ${私.length} 个 ══`);
for (const k of 私.sort()) {
  const 涉 = 目标.some(t => k.includes(t));
  console.log(`   ${涉 ? '⚠ ' : '  '}${k}`);
}
