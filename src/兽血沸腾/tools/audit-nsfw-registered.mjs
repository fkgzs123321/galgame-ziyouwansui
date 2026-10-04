// 核对 16 个角色的 私密档案/私密阶段 共 32 个条目是否都已注册、形状正确、关键词非空。
import fs from 'fs';

const st = JSON.parse(fs.readFileSync('src/兽血沸腾/tavern-cards-state.json', 'utf8'));
const all = st.entryManifest['角色'];

const ROSTER = ['凝玉', '艾薇尔', '崔蓓茜', '歌坦妮', '若尔娜', '黛丝', '贞德', '白素青',
  '谭雅', '阿仙奴', '许德拉', '歌莉妮', '唐蓓尔金娜', '梦露', '嘉宝', '艾莉婕'];

let ok = 0, bad = [];
console.log('角色     私密档案                          私密阶段');
console.log('─'.repeat(96));
for (const n of ROSTER) {
  const a = all[`${n}_私密档案`];
  const b = all[`${n}_私密阶段`];
  const f = (e, want) => {
    if (!e) return '✗ 缺';
    const c0 = e.contents?.[0];
    if (want === 'xml') {
      const isXml = c0 && typeof c0.content === 'string' && c0.content.startsWith('---\n<character_other');
      const hasPath = e.path === undefined;
      return (isXml && hasPath ? '✓' : '✗') + ` kw=${(e.keywords || []).length} ${e.strategy}/${e.scope ?? '-'}`;
    }
    const isEjs = typeof e.path === 'string';
    return (isEjs ? '✓' : '✗') + ` kw=${(e.keywords || []).length} ${e.strategy}/${e.scope ?? '-'}`;
  };
  const fa = f(a, 'xml'), fb = f(b, 'ejs');
  if (fa.startsWith('✓') && fb.startsWith('✓')) ok++; else bad.push(n);
  console.log(n.padEnd(9) + fa.padEnd(34) + fb);
}
console.log('─'.repeat(96));
console.log(`形状+关键词合规: ${ok}/${ROSTER.length}` + (bad.length ? `  异常: ${bad.join('、')}` : ''));

const priv = Object.keys(all).filter(k => k.includes('_私密'));
console.log(`\n私密条目总数: ${priv.length}`);
const noKw = priv.filter(k => !(all[k].keywords || []).length);
console.log(`关键词为空的私密条目: ${noKw.length ? noKw.join('、') : '无'}`);

// 残留旧名
for (const stale of ['珊瑚美人_基础信息', '珊瑚美人_私密档案', '珊瑚美人_私密阶段']) {
  console.log(`残留 ${stale}: ${all[stale] || st.entryManifest['世界观']?.[stale] ? '⚠ 仍存在' : '无'}`);
}
