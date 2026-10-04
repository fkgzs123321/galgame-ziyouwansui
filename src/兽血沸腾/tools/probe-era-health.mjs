// 对每个已分档的 基础信息.yaml，在若干纪元渲染出 身份 一类字段，肉眼看有没有早期泄漏。
// 这是「改完到底对不对」的快速体检：只打印键值，不做判断。
import fs from 'node:fs';
import path from 'node:path';
import { render } from './ejs-render.mjs';

function 遍历(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) 遍历(p, out);
    else if (e.name === '基础信息.yaml') out.push(p);
  }
  return out;
}

const 关注 = /身份|现状|头衔|归属|名分|职位|称号|立场|结局|后来/;
const 章们 = [0, 20, 73, 245, 500, 763];
const 文件们 = 遍历('src/兽血沸腾/世界书/角色');

// 外门（contents 首片段的 @@if）决定这个条目从哪一章起才存在。
// 不看外门就会误判：朝河兰的内联分支在 chap=0 也能渲染出复仇剧情，但条目本身
// 要到 716 章才注入，所以那不叫泄漏。体检必须把外门印出来才能读懂结果。
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const 外门 = new Map();
for (const 类型 of ['角色', 'NPC']) {
  for (const [名, v] of Object.entries(st.entryManifest[类型] || {})) {
    const f = v.path || (v.contents || []).find(c => c.file)?.file;
    if (!f) continue;
    const 门 = (v.contents || []).map(c => c.content || '').find(c => c.trim().startsWith('@@if '));
    if (门) 外门.set(f.replace(/\\/g, '/'), 门.trim());
  }
}

let 报告 = '';
let 有门 = 0;
for (const f of 文件们.sort()) {
  const 原 = fs.readFileSync(f, 'utf8');
  if (!原.includes('<%_')) continue;
  有门++;
  const rel = path.relative('src/兽血沸腾/世界书', f).replace(/\\/g, '/');
  const 原清 = 原.replace(/^@@.*$/gm, '');
  const 本门 = 外门.get('世界书/' + rel) ?? '（无外门，登场=0）';
  报告 += `\n════ ${rel} ════\n  外门: ${本门}\n`;
  const 各章 = new Map();
  for (const c of 章们) {
    const r = render(原清, { 'stat_data.剧情.章节序号': c });
    if (r.error) { 报告 += `  [${c}] 渲染错误: ${r.error}\n`; continue; }
    // 抽 YAML 里所有叶子键值，筛出关注字段（含嵌套：只看末级键名）
    const 命中 = [];
    for (const line of r.text.split(/\r?\n/)) {
      const m = line.match(/^(\s*)([^:\s][^:]*):\s*(.+?)\s*$/);
      if (!m) continue;
      if (!关注.test(m[2])) continue;
      命中.push(`${m[2]}=${m[3]}`);
    }
    各章.set(c, 命中);
  }
  // 只打印相邻纪元之间有差异的字段，减少噪音
  const 全部键 = new Set();
  for (const v of 各章.values()) for (const x of v) 全部键.add(x.split('=')[0]);
  for (const k of 全部键) {
    const seq = 章们.map(c => (各章.get(c) || []).find(x => x.startsWith(k + '='))?.slice(k.length + 1) ?? '（无）');
    if (new Set(seq).size === 1) continue; // 全程相同，不打印
    报告 += `  ${k}:\n`;
    章们.forEach((c, i) => { 报告 += `    [${c}] ${seq[i]}\n`; });
  }
}

fs.writeFileSync('src/兽血沸腾/tools/_分档体检.txt', `已分档文件 ${有门} 个\n${报告}`, 'utf8');
console.log(`已分档文件 ${有门} 个，报告写 tools/_分档体检.txt`);
