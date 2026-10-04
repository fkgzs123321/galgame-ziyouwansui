// 按纪元核对主角档案：对若干章节序号渲染，只抽出关键行，写成 UTF-8 报告。
import fs from 'node:fs';
import { render } from './ejs-render.mjs';

const raw = fs.readFileSync('src/兽血沸腾/世界书/角色/刘震撼/基础信息.yaml', 'utf8');
const 关心 = ['身份:', '秘银手臂:', '纹身:', '第三只眼:', '惯常装扮:', '花王形态:', '血之祭奠的诅咒:', '阶位经历:', '断臂:', '封地:', '终盘:', '血系魔力:', '花系:', '金刚伏魔之力:', '战歌卷轴:', '战歌图腾柱:', '海伦.列娜:', '凝玉:', '艾薇尔:', '黛丝与若尔娜:', '崔蓓茜:', '壹条:', '古德与贝拉米:', '安度兰长老:', '穆里尼奥:', '隆美尔:', '李察王子:', '嘉宝:'];
const CH = [0, 6, 15, 18, 20, 24, 27, 47, 53, 59, 73, 85, 146, 150, 159, 213, 255, 281, 306, 331, 341, 418, 427, 446, 512, 560, 763];
const out = [];
for (const c of CH) {
  const r = render(raw, { 'stat_data.剧情.章节序号': c });
  if (r.error) { out.push(`════ chap=${c}  ERROR ${r.error}`); continue; }
  out.push(`════ chap=${c} ════`);
  for (const L of r.text.split('\n')) {
    const t = L.trim();
    if (关心.some(k => t.startsWith(k))) out.push('   ' + t);
  }
}
fs.writeFileSync('src/兽血沸腾/tools/_liu-era.txt', out.join('\n'), 'utf8');
console.log(`已写 _liu-era.txt，共 ${out.length} 行`);
