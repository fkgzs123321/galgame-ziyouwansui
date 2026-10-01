// 决定性实验：把 @@if 作为 contents 首片段前置到已有 @@private 的文件上，
// 看 forge 的 resolveLeafContent 拼出的正文是否被 check-ejs / check-yaml 接受。
// 不写 state，只在内存里模拟 resolveLeafContent 的拼接方式。
import fs from 'fs';

const PROJ = 'src/兽血沸腾';

// resolveLeafContent 的实现：contents.map(f => f.file ? read(f.file) : f.content).join('\n')
const 读 = p => fs.readFileSync(p.startsWith(PROJ) ? p : `${PROJ}/${p}`, 'utf8');
const resolveLeafContent = leaf => (leaf.contents || []).map(f => (f.file ? 读(f.file) : (f.content ?? ''))).join('\n');

// 用海伦.列娜 的性格调色盘（Shape B，文件 L1 = @@private）做样本
const st = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));
const leaf = st.entryManifest.角色['海伦.列娜_性格调色盘'];
console.log('样本 leaf:', JSON.stringify({ path: leaf.path, contents: leaf.contents }, null, 1).slice(0, 300));

const 原 = resolveLeafContent(leaf);
console.log('\n── 原始拼接结果前 3 行 ──');
原.split('\n').slice(0, 3).forEach((l, i) => console.log(`  ${i}: ${JSON.stringify(l)}`));

// 模拟「前置 @@if 片段」
const 改写 = {
  ...leaf,
  contents: [
    { content: "@@if getvar('stat_data.剧情.章节序号', { defaults: 0 }) >= 6" },
    ...(leaf.contents || []),
  ],
};
const 新 = resolveLeafContent(改写);
console.log('\n── 前置 @@if 后前 4 行 ──');
新.split('\n').slice(0, 4).forEach((l, i) => console.log(`  ${i}: ${JSON.stringify(l)}`));

// 用 check-ejs 的判据检查：首行须 @@、装饰器与内容之间不能有空行
const lines = 新.split('\n');
console.log(`\n首行以 @@ 开头: ${lines[0].startsWith('@@')}`);
console.log(`第 2 行非空（装饰器后不得有空行）: ${lines[1].trim() !== ''}  → ${JSON.stringify(lines[1].slice(0, 40))}`);

// check-ejs 只剥一个装饰器行；剥掉后剩下的首行仍是 @@private ⇒ 会怎样？
const body = 新.replace(/^@@(private|if|generate_before|generate_after|render_before|render_after)[^\n]*\n/, '');
console.log(`\n剥一个装饰器后，剩余首行: ${JSON.stringify(body.split('\n')[0])}`);
console.log(`⇒ 剩余首行仍是装饰器: ${body.split('\n')[0].startsWith('@@')}`);

// 真实 EJS 渲染测试：能否真的按条件返回空
console.log('\n── 结论判据 ──');
console.log('若「剥一个装饰器后首行仍是 @@」，则 check-ejs.mjs 的 body 仍是 EJS 源码，');
console.log('它随后会拿这段去 YAML.parse，必然失败 —— 需要看 check-ejs 是否对 @@private 特判。');
