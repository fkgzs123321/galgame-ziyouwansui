// 只读：列出每个 基础信息.yaml 的「纪元敏感小节」键名（只列键，不列正文），
// 用于规划「软纪元降级」的逐项章节守卫。
import fs from 'fs';
import path from 'path';

const ROLE = 'src/兽血沸腾/世界书/角色';
const era = JSON.parse(fs.readFileSync('src/兽血沸腾/tools/era-table.json', 'utf8'));
const 登场 = new Map(era.表.map(r => [r.名, r.登场]));

// 只取「二级键」（两个空格缩进）
function 小节(L, 起) {
  if (起 < 0) return null;
  const out = [];
  for (let i = 起 + 1; i < L.length; i++) {
    const l = L[i];
    if (!l.trim()) continue;
    if (/^\S/.test(l)) break;            // 回到顶层
    const m = l.match(/^ {2}([^\s#][^:]*?)\s*[:：]/);
    if (m) out.push(m[1].trim());
  }
  return out;
}

const 清单 = {};
for (const d of fs.readdirSync(ROLE, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'zh'))) {
  if (!d.isDirectory()) continue;
  const p = path.join(ROLE, d.name, '基础信息.yaml');
  if (!fs.existsSync(p)) continue;
  const L = fs.readFileSync(p, 'utf8').split('\n');
  // 顶层键可能只有 基本信息 / 角色档案（后者再套一层）
  const 顶层 = L.filter(l => /^\S/.test(l) && /[:：]\s*$/.test(l)).map(l => l.replace(/[:：]\s*$/, '').trim());
  const 找 = n => L.findIndex(x => new RegExp(`^\\s*${n}\\s*[:：]`).test(x));
  const sec = {};
  for (const n of ['基本信息', '外貌特征', '背景设定', '能力体系', '关系设定']) sec[n] = 小节(L, 找(n));
  // 角色档案 下再嵌一层
  if (顶层.includes('角色档案')) {
    for (const n of ['基本信息', '外貌特征', '背景设定', '能力体系']) {
      const i = L.findIndex(x => new RegExp(`^ {2}${n}\\s*[:：]`).test(x));
      if (i >= 0) sec[n] = 小节(L, i);
    }
  }
  清单[d.name] = { 登场: 登场.get(d.name), 顶层, 节: sec };
}

let n = 0;
for (const [名, v] of Object.entries(清单)) {
  const 敏感 = ['背景设定', '能力体系', '关系设定'].filter(s => v.节[s]?.length);
  const 旗 = 敏感.length ? '★' : ' ';
  console.log(`${旗} ${String(v.登场).padStart(4)} ${名.padEnd(14)} 顶层[${v.顶层.join(',')}]`);
  for (const s of ['基本信息', '背景设定', '能力体系', '关系设定']) {
    if (v.节[s]?.length) console.log(`       ${s}(${v.节[s].length}): ${v.节[s].join(' / ')}`);
  }
  if (敏感.length) n++;
}
console.log(`\n含纪元敏感小节的角色: ${n} / ${Object.keys(清单).length}`);

fs.writeFileSync('src/兽血沸腾/tools/identity-items.json', JSON.stringify(清单, null, 2), 'utf8');
console.log('→ 已写 tools/identity-items.json');
