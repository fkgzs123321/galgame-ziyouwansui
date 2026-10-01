import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const ROOT = 'src/兽血沸腾/世界书/角色';
const ROSTER = ['凝玉','艾薇尔','崔蓓茜','歌坦妮','若尔娜','黛丝','贞德','白素青','谭雅','阿仙奴','许德拉','歌莉妮','唐蓓尔金娜','梦露','嘉宝','艾莉婕'];
const load = (f) => YAML.parse(fs.readFileSync(f, 'utf8').replace(/^@@[^\n]*\n/, '').split('\n').filter((l) => !/^\s*<%_?/.test(l)).join('\n'));

// 语义归类：把两边的键映射到同一批「身体部位」
const CANON = [
  ['头发', /发|发肤|发色|辫/], ['脸', /面容|口舌|五官|脸/], ['眼', /眼/], ['手', /手|指|指甲/],
  ['胸乳', /奶子|奶头|乳晕|胸|乳房|乳/], ['腰腹', /腰|腹|肚脐|小腹/], ['臀', /臀/],
  ['腿', /腿/], ['足', /足|脚/], ['私处', /逼|阴唇|阴蒂|阴户|花|蚌|缝/], ['后庭', /屁眼|菊/],
  ['皮肤', /肤|皮|肌/], ['气味', /气味|气息|味道/], ['身高体量', /身量|身高|体态|姿态|骨架/],
];
const canonOf = (k) => { for (const [c, re] of CANON) if (re.test(k)) return c; return null; };

console.log('══ 基础信息.外貌特征 的键 vs 私密.外观 的键（按身体部位归类）══\n');
let tot = 0;
for (const n of ROSTER) {
  const b = load(path.join(ROOT, n, '基础信息.yaml'));
  const p = load(path.join(ROOT, n, '私密.yaml'));
  const bk = Object.keys(b.外貌特征 || {});
  const pk = Object.keys(p.外观 || {});
  const bset = new Set(bk.map(canonOf).filter(Boolean));
  const shared = pk.map(canonOf).filter((c) => c && bset.has(c));
  if (shared.length) {
    tot += shared.length;
    console.log(`【${n}】共有部位: ${[...new Set(shared)].join('、')}`);
    console.log(`   基础信息.外貌特征 ${bk.length} 键: ${bk.join('/')}`);
    console.log(`   私密.外观        ${pk.length} 键: ${pk.join('/')}\n`);
  }
}
console.log('合计 ' + tot + ' 处部位级重合');
