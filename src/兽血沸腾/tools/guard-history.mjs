// 为 19 个「纪」文件加章节守卫。
// 原则：远古/千年前节点保持常驻（保证章节 0 仍渲染出内容）；属于 764 章当代
// 剧情的节点从该剧情所在卷起点起可见。相邻同起点节点合并为一个条件块。
// 远古节点里若混入当代专名，就地改写为中性历史表述。
import fs from 'fs';
import path from 'path';

const R = 'src/兽血沸腾/世界书/时间线';
const CHAP = "getvar('stat_data.剧情.章节序号', { defaults: 0 })";

// 节点 → 起始章节。未列出者用 defaultLo。0 = 不设守卫。
const SPEC = {
  '主角前史': { defaultLo: 9, nodes: { 穿越前: 0, 穿越落点: 0, 性格底色: 0, 诅咒来源: 9, 姓名由来: 9, 名号沿革: 73 } },
  '云秦方士纪': {
    defaultLo: 31, nodes: {
      洛书与阵法起源: 0, 云秦荡平六国: 0, 十二金人铸成: 0, 七宝塔圈饿书儒: 0, 方士的营生与红铅: 0,
      船队纵横七海: 0, 蚌人归附与离水玉佩: 0, 寻药船与千年漂流: 0, 阵法失传: 0,
      安尔乐法阵入海族: 31, 云秦余脉入爱琴: 43,
    }
  },
  '人类诸国兴替纪': {
    defaultLo: 73, nodes: {
      芒克自立门户: 0, 海加尔战后分裂: 0, 耶斯特帝国遗产: 0, 骏鹰骑士诞生: 0,
      慕兰吞并十七国: 0, 三大军事强国: 0,
      秘银矿与基座战甲: 73, 钢铁魔偶与精金: 73, 两大帝国的对峙: 73,
    }
  },
  '冥界·三统领纪': {
    defaultLo: 245, nodes: {
      冥界与三大统领: 0, 死亡领主四件套: 0, 冥界三神器尽毁: 0,
      四件套散落爱琴: 245, 血河统领初叩关: 245, 冥族潜入森林: 245, 森林之怒绞杀: 245,
      虬角与血系领域: 245, 血河统领被俘: 245, 名剑召唤采玉城: 245, 换俘与统领之死: 705,
    }
  },
  '创世与神话纪': { defaultLo: 0, nodes: {} },
  '唐藏花衔纪': {
    defaultLo: 0, nodes: {
      唐藏亲王东来: 43, 花王归位与花将诞生: 73, 花相确认花王: 245, 风尘四花之争: 245, 花廷总坛倾覆: 245,
    }
  },
  '圣保罗教廷扩张纪': {
    defaultLo: 0, nodes: {
      两位教廷龙骑士: 43, 讨伐比蒙的战书: 43, 苍穹先知的推算: 43,
      神迹降生的圣子: 245, 圣阶陨落与帝梵西血洗: 245,
    }
  },
  '大陆历史': { defaultLo: 0, nodes: {} },
  '战后千年对峙纪': { defaultLo: 0, nodes: { 圣山回归议题: 73 } },
  '比蒙王国纪元': { defaultLo: 0, nodes: { 连坐废止与十年生聚: 73, 萨尔加冕与削权: 73 } },
  '海加尔战役纪': { defaultLo: 0, nodes: {} },
  '海族与西雅海国纪': { defaultLo: 0, nodes: { 公主出走与封海: 21, 娜迦登陆与缴械: 43, 海慕联军西征: 245 } },
  '矮人与地底纪元': { defaultLo: 0, nodes: { 地底军力的现实: 73 } },
  '神系与信仰纪': { defaultLo: 0, nodes: { 神曲萨满现世: 245, 冰雪女神教对话: 245, 教廷的圣诗: 245 } },
  '神魔大战纪': { defaultLo: 0, nodes: { 万年之期将满: 21 } },
  '精灵与德鲁伊纪': { defaultLo: 0, nodes: { 森林危局: 73 } },
  '采玉城与卓尔纪': { defaultLo: 0, nodes: { 采玉城的迁址与兴建: 73, 卓尔迁回地表: 73, 缺粮与掠夺: 73 } },
  '魔界·嘉宝夺位纪': {
    defaultLo: 245, nodes: {
      三大陆分治成局: 0, 王爵位次与王族血脉: 0, 克隆药丸与王位限数: 0,
      女王坐镇海岸贡献: 245, 天王竞选与左岸补位: 245, 魔龙密约与圣火熄灭: 245,
      斩首突袭爱琴: 245, 先遣军备战爱琴: 245, 裂缝封阖与魔族断粮: 245, 三对三的邀战: 705,
    }
  },
  '龙骑士时代与衰落纪': { defaultLo: 0, nodes: { 三位龙骑士压境: 73, 慕兰双龙骑: 73, 替代兵种的兴起: 73 } },
};

// 常驻节点里的当代前向引用 → 中性历史表述。按「唯一子串」匹配，保留原缩进。
const FIX = [
  ['人类诸国兴替纪', '被用来射杀翡冷翠的火鹤', '被用来射杀骑乘飞行兽的斥候'],
  ['创世与神话纪', '四大杜伊嘉尔如今齐聚翡冷翠，泰坦巡游战舰图纸可拼齐，龙骨所需富氧金属量太大，短期内只能先造舰上武器',
    '四大杜伊嘉尔的血脉散落各地，泰坦巡游战舰图纸被分成四份，缺任何一份都造不出龙骨'],
  ['创世与神话纪', '构成翡冷翠的泰坦血脉附庸', '在爱琴各地的巨人谱系里都能找到同源分支'],
  ['创世与神话纪', '寒潭冻土、时空大裂缝一类地点是终盘战局的开关', '寒潭冻土与时空大裂缝一类地点的禁制一旦松动，战局就会转向'],
  ['大陆历史', '猛犸族遗民后来归附翡冷翠，俄勒芬猛犸族成了领地的骑兵主力之一',
    '猛犸族在海加尔战役后被官方遗忘，只余零星记载散落在荒原各部'],
  ['大陆历史', '多洛特公国的佣兵传统，为翡冷翠后来的雇佣兵与外交路线提供了接口',
    '多洛特公国的佣兵传统，是荒原上唯一成规模的人力市场'],
  ['海加尔战役纪', '猛犸族第一勇士科里纳与老波吉长老应召进入翡冷翠', '猛犸族的勇士与长老退守泰穆尔拉雅雪山，从此与世隔绝'],
  ['海加尔战役纪', '托蒂伯爵以打通通往海加尔圣山道路为条件向翡冷翠求活', '托蒂伯爵因战败失势，被剥夺采邑逐出贵族之列'],
  ['海族与西雅海国纪', '淡水美人鱼发明了离水保湿法阵，与花精灵一同编入翡冷翠法师团',
    '淡水美人鱼发明了离水保湿法阵，靠它在陆地久留不腐'],
  ['矮人与地底纪元', '精金羽箭、摩云磁暴灯与火铳的生产地设在依托井梯与翡冷翠地下层的地底兵工厂',
    '精金羽箭、摩云磁暴灯与火铳的生产地设在井梯深处的地底兵工厂'],
  ['矮人与地底纪元', '卢塞恩统治着三十万灰矮人与两百万河仙人', '这座地底城的统治者手里有三十万灰矮人与两百万河仙人'],
  ['矮人与地底纪元', '盾斧矮人被当作换取红土高坡的筹码，实质本就打算投奔翡冷翠',
    '盾斧矮人被当成人情送给外人，骨子里本就想脱离地底'],
  ['矮人与地底纪元', '坎通纳的血婴破坏了时空大裂缝的魔法禁制后被赶到多瑙荒原',
    '坎通纳的血婴破坏了时空大裂缝的魔法禁制，他因此被赶出地底'],
  ['精灵与德鲁伊纪', '这处泉眼诞生于上万年的森林之中，一滴泉水即可让人不经交媾孕育崭新的生命，翡冷翠与比蒙军部都盯着它',
    '这处泉眼诞生于上万年的森林之中，一滴泉水即可让人不经交媾孕育崭新的生命，各方势力都盯着它'],
  ['精灵与德鲁伊纪', '精灵古树成了稀缺品，卢塞恩城把战争古树由十六棵增至二十棵即视为战力跃升',
    '精灵古树成了稀缺品，地底那座城把战争古树由十六棵增至二十棵即视为战力跃升'],
  ['精灵与德鲁伊纪', '卡卡闯时空大裂缝到魔界五十年，因劫富济贫遭巫妖王派兵围剿',
    '卡卡闯时空大裂缝到魔界五十年，因劫富济贫遭魔界派兵围剿'],
  ['采玉城与卓尔纪', '卢塞恩全民皆兵的基础压在地底世界的石腭穴居人身上', '这座地底城全民皆兵的基础压在地底世界的石腭穴居人身上'],
  ['采玉城与卓尔纪', '失去地底世界后卢塞恩最多只能保持十万常备军力', '一旦失去地底世界的兵源，它最多只能保持十万常备军力'],
  ['采玉城与卓尔纪', '隆美尔与比蒙之间的这笔旧账成了他日后借调翡冷翠的底色', '隆美尔与比蒙之间的这笔旧账，是他日后与比蒙往来的底色'],
  ['采玉城与卓尔纪', '隆美尔身世中的这一笔是翡冷翠拉住他的切口', '隆美尔身世中的这一笔，是旁人拿捏他的切口'],
  ['神系与信仰纪', '苦行僧在比蒙获得收留，成为神曲萨满改制神职时可吸纳的人力', '苦行僧在比蒙获得收留，成了比蒙境内唯一不受神庙管辖的僧团'],
  ['比蒙王国纪元', '国王后来以三百年无危害为由劝阻教宗清算旧案', '国王后来以三百年无危害为由压下了这桩旧案'],
  ['冥界·三统领纪', '本命武器可隔着时空大裂缝遥控使用，防线不能只盯正门', '本命武器可隔着时空大裂缝遥控使用，防线不能只盯正门'],
];

function splitNodes(lines) {
  const heads = [];
  lines.forEach((l, i) => { if (/^[^\s#][^:]*:\s*$/.test(l)) heads.push(i); });
  const nodes = [];
  for (let h = 0; h < heads.length; h++) {
    nodes.push({ name: lines[heads[h]].replace(/:.*$/, ''), lines: lines.slice(heads[h], h + 1 < heads.length ? heads[h + 1] : lines.length) });
  }
  return { nodes };
}

let nFile = 0, nBlock = 0, nFix = 0;
const miss = [];
for (const [name, spec] of Object.entries(SPEC)) {
  const p = path.join(R, name + '.yaml');
  let text = fs.readFileSync(p, 'utf8');
  if (text.startsWith('@@')) { console.log(`·  ${name}.yaml 已有守卫，跳过`); continue; }

  for (const [f, from, to] of FIX.filter(x => x[0] === name)) {
    if (from === to) continue;
    if (!text.includes(from)) { miss.push(`${name}: ${from.slice(0, 26)}…`); continue; }
    text = text.split(from).join(to); nFix++;
  }
  for (const [f, from, to] of FIX.filter(x => x[0] === name)) {
    if (from !== to) continue;
    if (text.includes(from)) { text = text.split(from).join(to); nFix++; }
  }

  const lines = text.replace(/\n+$/, '').split('\n');
  const { nodes } = splitNodes(lines);
  const gates = nodes.map(n => ({ ...n, lo: spec.nodes[n.name] === undefined ? spec.defaultLo : spec.nodes[n.name] }));
  const unknown = nodes.filter(n => spec.nodes[n.name] === undefined).map(n => n.name);
  if (unknown.length) console.log(`   ⓘ ${name}: 未列表节点 → defaultLo=${spec.defaultLo}: ${unknown.join('、')}`);

  const runs = [];
  for (const g of gates) {
    const last = runs[runs.length - 1];
    if (last && last.lo === g.lo) last.nodes.push(g); else runs.push({ lo: g.lo, nodes: [g] });
  }

  const out = ['@@private', `<%_ const chap = ${CHAP}; _%>`];
  for (const r of runs) {
    if (r.lo === 0) { for (const n of r.nodes) out.push(...n.lines); }
    else {
      out.push(`<%_ if (chap >= ${r.lo}) { _%>`);
      for (const n of r.nodes) out.push(...n.lines);
      out.push('<%_ } _%>'); nBlock++;
    }
  }
  const res = out.join('\n').replace(/\n+$/, '') + '\n';
  if (res.includes('\n\n\n')) console.log(`   ⚠ ${name}: 出现三连空行`);
  fs.writeFileSync(p, res, 'utf8');
  nFile++;
  console.log(`✓  ${name}.yaml  ${text.length}→${res.length} B  节点 ${nodes.length}  条件块 ${runs.filter(r => r.lo > 0).length}`);
}
console.log(`\n处理 ${nFile} 个文件，条件块 ${nBlock} 个，就地改写 ${nFix} 行`);
if (miss.length) { console.log('\n⚠ 未匹配：'); miss.forEach(m => console.log('   ' + m)); }
