// 只读：扫出「基础信息/性格调色盘/NPC」里写成了终局状态的关系与身份表述。
// 判据：条目里出现「妻子/丈夫/夫人/领主夫人/后宫/育有/已死/继位/加冕为」等终局词，
//       且该角色首次登场章远早于这些关系成立的章。
import fs from 'fs';
import path from 'path';

const 角色 = 'src/兽血沸腾/世界书/角色';
const NPC = 'src/兽血沸腾/世界书/NPC';

const 终局词 = ['妻子', '夫人', '丈夫', '领主夫人', '后宫', '爱人与妻子', '育有', '为他生下',
  '已死', '战死', '阵亡', '继位', '称帝', '皇后', '加冕', '摄政', '殉', '遗孀',
  '第一任院长', '教女', '册封', '追随者之一'];

// 各档首次登场章（人工核定，来自之前审计）
const 登场 = {
  '海伦.列娜': 0, '茉儿': 5, '茜茜': 273, '姬丝凯碧': 71, '凝玉': 21, '艾薇尔': 100,
  '崔蓓茜': 43, '歌坦妮': 43, '若尔娜': 52, '黛丝': 30, '贞德': 59, '白素青': 400,
  '谭雅': 341, '阿仙奴': 245, '许德拉': 60, '歌莉妮': 60, '唐蓓尔金娜': 70, '梦露': 300,
  '嘉宝': 520, '艾莉婕': 200, '幽月儿': 260, '加茜娅': 176, '伦娜': 300, '费雯丽': 245,
  '朝河兰': 716, '珍妮佛': 140, '波姬小丝': 630, '赫莲娜': 210, '安瑞达': 520, '喀秋莎': 71,
  '海华丝': 588,
};

const 扫 = (dir, 前缀) => {
  const 出 = [];
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const files = [];
    if (d.isDirectory()) {
      for (const f of fs.readdirSync(path.join(dir, d.name))) {
        if (f === '基础信息.yaml' || f === '性格调色盘.yaml') files.push([f, path.join(dir, d.name, f)]);
      }
    } else if (d.name.endsWith('.yaml')) {
      files.push([d.name, path.join(dir, d.name)]);
    }
    for (const [f, p] of files) {
      const t = fs.readFileSync(p, 'utf8');
      const 命 = 终局词.filter(w => t.includes(w));
      if (命.length) 出.push({ 名: d.name.replace(/\.yaml$/, ''), f, 命, p: p.replace(/\\/g, '/') });
    }
  }
  return 出;
};

const 全部 = [...扫(角色, '角色'), ...扫(NPC, 'NPC')];
console.log(`══ 含终局表述的条目：${全部.length} 个 ══\n`);
for (const r of 全部) {
  const 章 = 登场[r.名];
  console.log(`${String(章 ?? '?').padStart(4)}  ${r.名.padEnd(14)} ${r.f.padEnd(16)} ${r.命.join('、')}`);
}
