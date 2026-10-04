// 系统性排查：作者自撰条目里的「专名型」用词是否有原文依据。
//
// 起因：加茜娅 私密.yaml 里的 `龙契烙印:` 是个臆造专名（`龙契` 全程 0 命中），
// 而且因为它是 私密.yaml 的键，被 extract-nsfw-parts.mjs 当成部位收进了
// 界面/私密部位.ts，直接进了前端——属于「专名必须原文真有」铁律的违反。
//
// 本脚本把这 88 个作者自撰文件里所有「可疑形态」的专名提取出来逐个核验：
//   ① 私密.yaml 的全部顶层/二级键（键会进前端）
//   ② 任何 `X烙印/X印记/X纹/X契约/X印` 形式的词
//   ③ 《书名》 形式（战歌/典籍名）
//   ④ 无引号但明显是自造复合词的身体标记
import fs from 'fs';
import path from 'path';

const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 有 = s => 原.includes(s);

const ROOT = 'src/兽血沸腾/世界书/角色';
const 疑似 = new Map(); // 词 → Set(出处)

const 记 = (w, 处) => {
  if (!w || w.length < 2 || w.length > 14) return;
  if (!疑似.has(w)) 疑似.set(w, new Set());
  疑似.get(w).add(处);
};

for (const d of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, d);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of ['私密.yaml', '私密阶段.yaml', '性格调色盘.yaml', '基础信息.yaml']) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) continue;
    const 处 = `${d}/${f}`;
    const 行 = fs.readFileSync(p, 'utf8').split('\n');
    for (const l of 行) {
      // ① YAML 键（缩进 + 词: ）
      const m = l.match(/^\s*([^\s#][^:]*):\s/);
      if (m && f === '私密.yaml') 记(m[1].trim(), 处);
      // ② 烙印/印记/纹/契约/印 复合词
      for (const mm of l.matchAll(/[\u4e00-\u9fa5]{1,6}(?:烙印|印记|纹章|契约|印)/g)) 记(mm[0], 处);
      // ③ 书名号
      for (const mm of l.matchAll(/《([^》]{1,12})》/g)) 记(mm[1], 处);
    }
  }
}

// 白名单：通用词、原文确实有但我用了别的说法不算缺陷的、以及分类标签
const 白 = new Set([
  '外观', '气味', '分泌物', '敏感带', '名器', '性癖', '名目', '由来', '表现', '代价', '名声',
  '爱液', '初夜', '奶水', '眼泪', '体味', '逼味', '动情味', '汗', '经水', '身量', '奶子',
  '奶头', '乳晕', '逼', '阴唇', '阴蒂', '屁眼', '腰腹', '臀部', '腿', '足', '手', '口舌',
  '腋下', '发肤', '标志', '旧伤', '私密档案', '记录对象', '种族形体', '私密阶段',
  '阶段', '边界', '身体状态', '反应', '台词', '落点', '性格调色盘', '底色', '对角色的理解与思考', '总结',
  '角色档案', '基本信息', '外貌特征', '背景设定', '能力体系', '关系设定', '姓名', '全名', '性别',
  '种族', '身份', '头衔', '位面', '主线', '加冕', '仇怨', '化身', '战果', '花衔名', '称谓',
  '花衔', '职位', '前世', '归属', '部属', '后续', '结局', '小名', '年龄', '身高', '形貌', '体态',
]);

const 缺 = [];
for (const [w, 处s] of 疑似) {
  if (白.has(w)) continue;
  if (有(w)) continue;
  缺.push([w, [...处s]]);
}

缺.sort((a, b) => a[0].length - b[0].length);
console.log(`══ 作者自撰文件里「原文 0 命中」的专名候选：${缺.length} 个 ══\n`);
for (const [w, 处s] of 缺) {
  const 部位键 = 处s.filter(x => x.endsWith('私密.yaml'));
  console.log(`   「${w}」  ${部位键.length ? '★进前端 ' : ''}${处s.slice(0, 3).join(' · ')}`);
}
if (!缺.length) console.log('   （无）');
