import fs from 'fs';
import YAML from 'yaml';

const ROOT = 'src/兽血沸腾';
const outline = YAML.parse(fs.readFileSync(`${ROOT}/故事大纲.yaml`, 'utf8'));
const plan = YAML.parse(fs.readFileSync(`${ROOT}/创作规划.yaml`, 'utf8'));

const ALL = ['黛丝', '若尔娜', '崔蓓茜', '歌坦妮', '果果', '壹条', '安度兰长老', '茉儿', '隆美尔', '李察王子'];

const out = [];
for (const n of ALL) {
  out.push(`\n${'═'.repeat(70)}\n════ ${n} ════`);
  const pc = (plan.characters ?? []).find(c => c.name === n);
  if (pc) {
    out.push('  [创作规划]');
    out.push(`    basic: ${JSON.stringify(pc.basic ?? {})}`);
    out.push(`    appearance: ${JSON.stringify(pc.appearance ?? [])}`);
    out.push(`    personality: ${JSON.stringify(pc.personality ?? {})}`);
    out.push(`    tri_faceted: ${pc.tri_faceted}`);
  }
  for (const c of (outline.characters ?? [])) {
    if (c.name !== n && !c.name.startsWith(n)) continue;
    out.push(`  [大纲档案 ${c.name}]`);
    out.push(`    identity: ${c.identity ?? ''}`);
    out.push(`    relationship: ${c.relationship ?? ''}`);
    out.push(`    personality: ${c.personality ?? ''}`);
    out.push(`    appearance: ${JSON.stringify(c.appearance ?? [])}`);
    out.push(`    引文 ${(c.quotes ?? []).length} 条:`);
    for (const q of (c.quotes ?? [])) {
      out.push(`      · [${q.chapter}] ${q.context ?? ''}`);
      out.push(`        「${(q.text ?? '').replace(/\n/g, ' ').slice(0, 200)}」`);
    }
  }
}

// 已写好的同类文件作为格式范本
const existing = ['穆里尼奥', '白素青', '嘉宝', '梦露'].map(x => `${ROOT}/世界书/角色/${x}/性格调色盘.yaml`);
out.push(`\n\n${'═'.repeat(70)}\n════ 已写好的同类条目（格式范本，勿抄内容） ════`);
for (const p of existing) {
  out.push(`\n──── ${p} ────\n${fs.readFileSync(p, 'utf8')}`);
}

// 三面性范本（隆美尔/李察王子已有，需与其口径一致）
out.push(`\n\n${'═'.repeat(70)}\n════ 三面性现有内容（隆美尔/李察王子，调色盘须与之衔接） ════`);
for (const n of ['隆美尔', '李察王子']) {
  const p = `${ROOT}/世界书/角色/${n}/三面性.yaml`;
  if (fs.existsSync(p)) out.push(`\n──── ${n}/三面性.yaml ────\n${fs.readFileSync(p, 'utf8')}`);
}

fs.writeFileSync(`${ROOT}/tools/派发素材_性格调色盘.txt`, out.join('\n'), 'utf8');
console.log(`已写出 ${out.length} 行 / ${fs.statSync(`${ROOT}/tools/派发素材_性格调色盘.txt`).size} B`);
