// 只读探针：按角色统计四类条目的字节数，核对 私密/私密阶段 的篇幅要求。
import fs from 'fs';
import path from 'path';

const R = 'src/兽血沸腾/世界书/角色';
const ROSTER = [
  '凝玉','艾薇尔','崔蓓茜','歌坦妮','若尔娜','黛丝','贞德','白素青','谭雅',
  '阿仙奴','许德拉','歌莉妮','唐蓓尔金娜','梦露','嘉宝','艾莉婕',
];
const F = { 基础信息: 'basic', 性格调色盘: 'palette', 私密: 'nsfw', 私密阶段: 'stage' };

const rows = [];
for (const n of ROSTER) {
  const r = { 名: n };
  for (const [f, k] of Object.entries(F)) {
    const p = path.join(R, n, f + '.yaml');
    r[k] = fs.existsSync(p) ? fs.statSync(p).size : null;
  }
  rows.push(r);
}

const hdr = ['名', '基础信息', '性格调色盘', '私密', '私密阶段', '合计'];
console.log(hdr.map((h, i) => h.padEnd(i === 0 ? 14 : 11)).join(''));
console.log('─'.repeat(70));
const sum = { basic: 0, palette: 0, nsfw: 0, stage: 0 };
for (const r of rows) {
  const t = ['basic', 'palette', 'nsfw', 'stage'].reduce((a, k) => a + (r[k] || 0), 0);
  for (const k of Object.keys(sum)) sum[k] += r[k] || 0;
  console.log(
    [
      r.名.padEnd(12),
      String(r.basic || '—').padStart(9),
      String(r.palette || '—').padStart(11),
      String(r.nsfw || '—').padStart(9),
      String(r.stage || '—').padStart(10),
      String(t).padStart(10),
    ].join('  '),
  );
}
console.log('─'.repeat(70));
console.log(
  [
    '合计'.padEnd(12),
    String(sum.basic).padStart(9),
    String(sum.palette).padStart(11),
    String(sum.nsfw).padStart(9),
    String(sum.stage).padStart(10),
    String(Object.values(sum).reduce((a, b) => a + b, 0)).padStart(10),
  ].join('  '),
);
console.log(
  `\n人均: 基础信息 ${(sum.basic / 16 / 1024).toFixed(1)} KB | 调色盘 ${(sum.palette / 16 / 1024).toFixed(1)} KB |` +
    ` 私密 ${(sum.nsfw / 16 / 1024).toFixed(1)} KB | 私密阶段 ${(sum.stage / 16 / 1024).toFixed(1)} KB`,
);

console.log('\n── 私密.yaml 低于 8 KB 的（用户要求 8-12 KB）──');
const 薄 = rows.filter(r => (r.nsfw || 0) < 8192);
console.log(薄.length ? 薄.map(r => `  ${r.名} ${r.nsfw} B`).join('\n') : '  无');
console.log('\n── 私密阶段.yaml 低于 3 KB 的 ──');
const 薄2 = rows.filter(r => (r.stage || 0) < 3000);
console.log(薄2.length ? 薄2.map(r => `  ${r.名} ${r.stage} B`).join('\n') : '  无');
