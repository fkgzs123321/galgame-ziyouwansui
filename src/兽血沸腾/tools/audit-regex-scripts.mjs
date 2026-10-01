// 只读探针：核对 7 条正则的 findRegex 是否真能在卡内容里命中，以及替换目标是否可达。
import fs from 'fs';

const card = JSON.parse(fs.readFileSync('src/兽血沸腾/兽血沸腾.json', 'utf8'));
const d = card.data;

const parts = [d.first_mes || '', ...(d.alternate_greetings || [])];
(d.character_book?.entries || []).forEach(e => parts.push(e.content));
const 全文 = parts.join('\n');

// 正则会匹配的实际载体：first_mes / greetings / 世界书条目内容
// 兼容两种写法：纯字符串 与 /pattern/flags
const toRe = raw => {
  const m = String(raw).match(/^\/([\s\S]*)\/([gimsuy]*)$/);
  return m ? new RegExp(m[1], m[2].includes('g') ? m[2] : m[2] + 'g') : new RegExp(raw, 'g');
};

console.log('── 正则 findRegex 命中统计 ──');
for (const r of d.extensions?.regex_scripts || []) {
  const re = toRe(r.findRegex);
  const n = Array.from(全文.matchAll(re)).length;
  const 目标 = (r.replaceString || '').match(/dist\/[^"')]+/);
  console.log(
    `  ${(r.scriptName || '').padEnd(20)} promptOnly=${String(r.promptOnly).padEnd(6)}` +
      ` 命中=${String(n).padEnd(4)}` +
      (目标 ? ` → ${目标[0]}` : ' → (置空)'),
  );
}

console.log('\n── 替换目标 URL 的可达性 ──');
for (const r of d.extensions?.regex_scripts || []) {
  const m = (r.replaceString || '').match(/https:\/\/[^"')]+/);
  if (!m) continue;
  const url = m[0];
  const 本地 = url.replace('https://testingcf.jsdelivr.net/gh/StageDog/tavern_helper_template/', 'dist/');
  const 存在 = fs.existsSync(本地);
  console.log(`  ${存在 ? '✓' : '✗'} ${url}`);
  if (存在) console.log(`      → ${本地}  ${fs.statSync(本地).size} B`);
}

console.log('\n── 界面产物里的占位符 ──');
for (const 名 of ['状态栏', '开局表单']) {
  const p = `dist/兽血沸腾/界面/${名}/index.html`;
  if (!fs.existsSync(p)) {
    console.log(`  ✗ ${p} 不存在`);
    continue;
  }
  console.log(`  ${名}: ${fs.statSync(p).size} B`);
}
