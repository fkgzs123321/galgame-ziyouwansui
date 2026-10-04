import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

// 检测两类 YAML 结构缺陷：
//  A. 解析失败（硬错误）
//  B. 静默折叠：映射键的值为字符串，但该字符串里含多个「 - 」，
//     说明本该是列表的内容被折叠成了一个标量，数据仍在但结构已丢
//  C. 列表项与父键同缩进且后接同缩进的映射键（序列后接映射，非法结构的前兆）

const ROOT = 'src/兽血沸腾';
const EXTS = ['.yaml', '.yml'];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      walk(p, out);
    } else if (EXTS.includes(path.extname(e.name))) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(ROOT);
const hardErrors = [];
const folded = [];
const seqThenMap = [];

function scanFolded(node, file, trail) {
  if (node === null || node === undefined) return;
  if (typeof node === 'string') {
    // 折叠特征：出现 2 次以上「 - 」或「\n- 」
    const dashes = (node.match(/\s-\s/g) || []).length;
    const newlineDash = (node.match(/\n\s*-\s/g) || []).length;
    if (dashes + newlineDash >= 2) {
      folded.push({ file, trail, sample: node.slice(0, 90).replace(/\n/g, '\\n') });
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => scanFolded(v, file, `${trail}[${i}]`));
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) scanFolded(v, file, trail ? `${trail}.${k}` : k);
  }
}

for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  // EJS 条目首行是 @@ 装饰器，YAML 本就无法解析，check-yaml.mjs 亦跳过。
  // 另外，段落控制（<%_ if ... _%>）写在内容文件里时，文件本身未必以 @@ 开头
  // （条目显隐门放在 entryManifest 的 contents 首片段），这类文件同样不是 YAML，
  // 必须一并跳过，否则会误报「A. 解析失败」。判据与 check-yaml.mjs 保持一致。
  const isEjs = text.startsWith('@@') || text.includes('<%_') || text.includes('@@');
  let doc;
  try {
    doc = YAML.parse(text);
  } catch (e) {
    if (!isEjs) hardErrors.push({ file: f, msg: (e.message || '').split('\n')[0] });
    continue;
  }
  scanFolded(doc, f, '');

  // C: 序列后接同缩进映射键
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)-\s/);
    if (!m) continue;
    const ind = m[1].length;
    for (let j = i + 1; j < lines.length; j++) {
      const l = lines[j];
      if (l.trim() === '' || l.trim().startsWith('#')) continue;
      const ind2 = l.match(/^\s*/)[0].length;
      if (ind2 < ind) break;
      if (ind2 === ind && /^\s*[^\s-][^:]*:\s*(\S.*)?$/.test(l)) {
        seqThenMap.push({ file: f, line: j + 1, text: l.trim().slice(0, 70) });
      }
      break;
    }
  }
}

console.log(`扫描 ${files.length} 个 YAML 文件\n`);
console.log(`A. 解析失败: ${hardErrors.length}`);
for (const e of hardErrors) console.log(`   ${e.file}\n     ${e.msg}`);
console.log(`\nC. 序列后接同缩进映射键: ${seqThenMap.length}`);
for (const e of seqThenMap) console.log(`   ${e.file}:${e.line}  ${e.text}`);
console.log(`\nB. 疑似被折叠成标量的列表: ${folded.length}`);
for (const e of folded.slice(0, 30)) console.log(`   ${e.file}  [${e.trail}]\n     ${e.sample}`);
