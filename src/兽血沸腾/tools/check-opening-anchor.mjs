// 校验每个开局的 章节节点 名称与 章节序号 是否对得上 故事大纲.yaml 的 chapters。
// 章节序号是全部阶段/事件条目的渲染开关，锚点写错就会在错误的纪元开局。
import fs from 'node:fs';
import YAML from 'yaml';

const 大纲 = YAML.parse(fs.readFileSync('src/兽血沸腾/故事大纲.yaml', 'utf8'));
const 章 = 大纲.chapters;
const 标题 = i => (章[i]?.title ?? 章[i]?.name ?? 章[i]?.标题 ?? '').toString().trim();

const 目录 = 'src/兽血沸腾/开场白/initvar';
let 问题 = 0;
for (const f of fs.readdirSync(目录).filter(x => x.endsWith('.yaml')).sort()) {
  const t = fs.readFileSync(`${目录}/${f}`, 'utf8');
  const m = t.match(/^\s*章节序号:\s*(\d+)/m);
  const n = t.match(/^\s*章节节点:\s*(.+?)\s*$/m);
  const v = t.match(/^\s*当前卷:\s*(.+?)\s*$/m);
  if (!m) { console.log(`${f}  ✗ 缺 章节序号`); 问题++; continue; }
  const idx = Number(m[1]);
  const 节点 = n ? n[1] : '';
  const 真 = 标题(idx);
  // 大纲标题形如「第一百八十五章 内务统筹」，开局的 章节节点 只写后半个短语也能接受
  const 短语 = 节点.replace(/^第[一二三四五六七八九十百千零]+章\s*/, '');
  const 命中 = 真.includes(短语) || 真 === 节点 || 短语 === '';
  console.log(`${f}  idx=${String(idx).padStart(3)}  卷=${v ? v[1] : '?'}`);
  console.log(`      节点写的是: ${节点}`);
  console.log(`      大纲第${idx}章: ${真}`);
  if (!命中) { console.log(`      ✗ 对不上`); 问题++; } else { console.log(`      ✓`); }
}
console.log(`\n问题 ${问题} 处`);
