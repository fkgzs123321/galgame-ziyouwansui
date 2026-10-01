// 观察各类型 / 各 part 的 order 分布，为新增条目挑选不冲突的 order。
import fs from 'fs';
const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));

for (const [type, entries] of Object.entries(st.entryManifest)) {
  const byPart = {};
  for (const [k, v] of Object.entries(entries)) {
    const p = v.part ?? '(无part)';
    const o = v.position?.order ?? null;
    (byPart[p] ??= []).push(o);
  }
  const parts = Object.entries(byPart).map(([p, os]) => {
    const nums = os.filter(x => typeof x === 'number');
    return `${p}[${nums.length}${nums.length ? ` ${Math.min(...nums)}~${Math.max(...nums)}` : ''}]`;
  });
  console.log(`${type.padEnd(8)} ${Object.keys(entries).length} 条  ${parts.join('  ')}`);
}

// 角色 类型里所有 order 的完整序列（去重排序）
const R = st.entryManifest['角色'] || {};
const nums = [...new Set(Object.values(R).map(v => v.position?.order).filter(x => typeof x === 'number'))].sort((a, b) => a - b);
console.log(`\n角色 order 共 ${nums.length} 个不同值`);
console.log('前 10: ' + nums.slice(0, 10).join(', '));
console.log('后 20: ' + nums.slice(-20).join(', '));
