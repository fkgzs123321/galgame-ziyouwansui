// 二轮修补：① 核心特质不再硬截断 ② 去掉重复的 态度/互动方式 ③ 删空的 参考语料:
import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';

const LEAD = /^(在|用|把|将|拿|与|和|替|被|对|跟|从|为|给|一|有|是|会|爱|常|总|先|又|也|还|就)/;
// 只在完整词边界收尾：找不到边界就整句保留，绝不切在词中
const BOUND = /[让使把将用拿与和为对向从跟随]|起身|出手|开口|抬头|伸手|抽|挥|转身|掉头|带|领|排|架|举|叫|说|问|答|唱|喝|骂|笑|哭|打|杀|冲|退|坐|站|走|跑|看|听|想|要|给|收|放|送|取|留|存|换|买|卖/;
function keyword(c) {
  const x = c.replace(LEAD, '');
  const seg = x.split(/[，,、；;：]/)[0];
  if (seg.length <= 16) return seg;
  const m = seg.match(new RegExp(`^(.{6,16}?)(?=${BOUND.source})`));
  return m ? m[1] : seg;           // ← 不截断，保留整句
}

let k = 0, d = 0, e = 0;
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml'))) {
  const p = path.join(NPC, f);
  let t = fs.readFileSync(p, 'utf8');
  const before = t;

  // ① 核心特质
  const bm = t.match(/^  行为模式:\n((?:    - .*\n?)*)/m);
  if (bm) {
    const beh = [...bm[1].matchAll(/^    - (.*)$/gm)].map(m => m[1].replace(/^"|"$/g, ''));
    if (beh.length) {
      const nt = beh.slice(0, 3).map(keyword).filter(Boolean).join('、');
      t = t.replace(/^  核心特质: .*$/m, `  核心特质: ${nt}`);
    }
  }

  // ② 态度 与 互动方式 内容相同时，删掉 互动方式
  const mAtt = t.match(/^  态度: (.*)$/m);
  const mInt = t.match(/^  互动方式: (.*)$/m);
  if (mAtt && mInt && mAtt[1].trim() === mInt[1].trim()) {
    t = t.replace(/^  互动方式: .*\n?/m, ''); d++;
  }

  // ③ 只删「参考语料: 后面确实没有任何条目」的空块，以及尾部孤立字段名
  if (/^  参考语料:\n(?=\S|$)/m.test(t) || /^  参考语料:[ \t]*\n(?= *$)/m.test(t)) {
    t = t.replace(/^  参考语料:[ \t]*\n(?=\S|$)/m, '');
    e++;
  }
  t = t.replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '\n');

  if (t !== before) { fs.writeFileSync(p, t, 'utf8'); k++; }
}
console.log(`改写文件 ${k}；删重复互动方式 ${d}；删空参考语料 ${e}`);
