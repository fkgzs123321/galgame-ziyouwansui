import fs from 'fs';
import YAML from 'yaml';

const plan = YAML.parse(fs.readFileSync('src/兽血沸腾/创作规划.yaml', 'utf8'));
const NEED = ['黛丝', '若尔娜', '崔蓓茜', '歌坦妮', '果果', '壹条', '安度兰长老', '茉儿'];

for (const c of plan.characters ?? []) {
  if (!NEED.includes(c.name)) continue;
  console.log(`\n════ ${c.name} ════`);
  console.log(YAML.stringify({ basic: c.basic, appearance: c.appearance, personality: c.personality, tri_faceted: c.tri_faceted }, { lineWidth: 0 }).trim());
}
