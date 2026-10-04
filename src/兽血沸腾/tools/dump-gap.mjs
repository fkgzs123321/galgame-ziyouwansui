import fs from 'fs';
import YAML from 'yaml';

const ROOT = 'src/兽血沸腾';
const NEED = ['黛丝', '若尔娜', '崔蓓茜', '歌坦妮', '果果', '壹条', '安度兰长老', '茉儿'];
const outline = YAML.parse(fs.readFileSync(`${ROOT}/故事大纲.yaml`, 'utf8'));

const byName = {};
for (const c of outline.characters ?? []) (byName[c.name] ??= []).push(c);
const ALIAS = { 黛丝: ['黛丝', '仙女龙黛丝'], 崔蓓茜: ['崔蓓茜', '崔蓓茜.妮可'] };

const out = [];
for (const n of NEED) {
  out.push(`\n${'═'.repeat(70)}\n════ ${n} ════`);
  for (const key of (ALIAS[n] ?? [n])) {
    for (const c of (byName[key] ?? [])) {
      out.push(`  [档案 ${c.name}]`);
      out.push(`    identity: ${c.identity ?? ''}`);
      out.push(`    relationship: ${c.relationship ?? ''}`);
      out.push(`    personality: ${JSON.stringify(c.personality ?? '')}`);
      out.push(`    appearance: ${JSON.stringify(c.appearance ?? '')}`);
      out.push(`    引文 ${(c.quotes ?? []).length} 条:`);
      for (const q of (c.quotes ?? []).slice(0, 24)) {
        out.push(`      · [${q.chapter}] ${q.context ?? ''}`);
        out.push(`        「${(q.text ?? '').replace(/\n/g, ' ').slice(0, 150)}」`);
      }
    }
  }
}
fs.writeFileSync(`${ROOT}/tools/缺口素材.txt`, out.join('\n'), 'utf8');
console.log(`已写出 ${out.length} 行到 tools/缺口素材.txt`);

// 同时从 initvar 抽取现有关系档，作为模板
const iv = fs.readFileSync(`${ROOT}/世界书/变量/initvar.yaml`, 'utf8').split('\n');
const i0 = iv.findIndex(l => /^关系:/.test(l));
console.log('\n══ initvar 关系段 ══');
for (let i = i0; i < iv.length && i < i0 + 60; i++) {
  if (i > i0 && /^[^\s]/.test(iv[i])) break;
  console.log(`  ${iv[i]}`);
}
