// 当前剧情进度.yaml：把覆盖 73~763 的 else 分支拆成三档，与 9 篇进度的窗口一致。
import fs from 'fs';
const P = 'src/兽血沸腾/世界书/时间线/当前剧情进度.yaml';
const raw = fs.readFileSync(P, 'utf8');
const lines = raw.split('\n');

const i = lines.findIndex(l => l.includes('} else {'));
const tail = lines.slice(i);
const endIdx = tail.findIndex((l, n) => n > 0 && /^<%_\s*\}\s*_%>\s*$/.test(l));
if (i < 0 || endIdx < 0) { console.log('结构不符，未改'); process.exit(1); }

// 在 L2 之后再插一个章节序号短名
const l2 = lines.findIndex(l => l.includes("const vol = getvar"));
if (l2 < 0) { console.log('未找到 vol 声明'); process.exit(1); }
lines.splice(l2 + 1, 0, `<%_ const chap = getvar('stat_data.剧情.章节序号', { defaults: 0 }); _%>`);

const NEW = [
  `<%_ } else if (chap <= 244) { _%>`,
  `比蒙王国纵横·成长期: 第二章 翡冷翠领主 → 第一百八十四章 大利西方`,
  `当前舞台: 威瑟斯庞、泰穆尔拉雅雪山、桑干河南岸的红土高坡与翡冷翠主城`,
  `剧情节点:`,
  `  - 总督罗森博格设宴接风，维安大萨满当众宣布晋级战争祭祀、封男爵，封地定在翡冷翠`,
  `  - 大萨满当面否认他的龙祭祀头衔，海伦与李察王子先后替他解围`,
  `  - 他在雪山收下俄勒芬族猛犸人，红土高坡上聚起多族混编的班底`,
  `  - 建立剑桥祭祀学院，量产战歌图腾柱，领地成为多族混居的根据地`,
  `约束:`,
  `  - 祭祀是辅助兵种，绝不参与近身肉搏`,
  `  - 领地经营须平衡人口、军饷与附庸族关系`,
  `  - 龙祭祀头衔始终不被神庙承认`,
  `<%_ } else if (chap <= 704) { _%>`,
  `比蒙王国纵横·扩张期: 第一百八十五章 内务统筹 → 第六百四十五章 决战，提前上演`,
  `当前舞台: 比蒙王国全境、地底世界、魔界与多瑙大荒原的各条战线`,
  `剧情节点:`,
  `  - 魔界与冥界的势力先后介入，战局从边境摩擦扩大成大陆级战争`,
  `  - 他的血系法术一路进阶，战歌与领地两条线同时铺开`,
  `  - 比蒙神庙、长老院与王室的权力结构在战事压力下重新洗牌`,
  `  - 决战的日期被一再提前，桑干河成为双方反复争夺的正面`,
  `约束:`,
  `  - 权杖祭祀与教宗等塔尖力量尚未投入决战`,
  `  - 领地与外交必须两条腿走，单靠战功撑不住`,
  `  - 神曲萨满不能削爵`,
  `<%_ } else { _%>`,
  `比蒙王国纵横·终盘: 第六百四十六章 桑干河前浪推后浪 → 第七百零七章 大结局`,
  `当前舞台: 桑干河两岸、采玉城、翡冷翠城下与白令山脉的时空大裂缝`,
  `剧情节点:`,
  `  - 比蒙发起总攻，海慕联军溃逃，人类十位高层密议屠灭卢塞恩`,
  `  - 介丘海加尔与废除双重国籍一并宣布，魔族借无水结界法阵翻越桑干河天险`,
  `  - 决战在大裂缝前收束，时空大裂缝被提前关闭`,
  `约束:`,
  `  - 权杖祭祀与教宗等塔尖力量在终战中大量阵亡`,
  `  - 神曲萨满不能削爵`,
  `<%_ } _%>`,
];

const keep = lines.slice(0, i);
const rest = lines.slice(i + endIdx + 1);
const out = [...keep, ...NEW, ...rest].join('\n');
fs.writeFileSync(P, out, 'utf8');
console.log(`原 ${raw.length} B → ${out.length} B`);
console.log(`else 段 ${endIdx + 1} 行 → ${NEW.length} 行`);
console.log('\n新文件的分支:');
out.split('\n').forEach((l, n) => { if (/<%_\s*\}\s*else|<%_\s*const|^\S.*:\s*第/.test(l)) console.log(`  ${n + 1}| ${l.slice(0, 92)}`); });
