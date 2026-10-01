// 禁词/八股/破折号全量扫描
import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/tavern_helper_template/src/兽血沸腾';

const RULES = [
  // ── 绝对红线：禁用词（出现即违规，含否定列举）──
  ['禁用词', /魔歌祭祀|战歌祭祀|英雄阶|传奇阶|魔幻法师|位阶/],
  // ── 未注册字段（旧版遗留，必须改成直陈式事实句）──
  ['未注册字段', /^\s*易错:/m],
  // ── 破折号 ──
  ['破折号', /——/],
  // ── 八股黑名单 ──
  ['八股·模糊比喻', /似乎|几乎|仿佛|如同|宛如|好似|犹如/],
  ['八股·陈旧意象', /像小兽|投石入湖|心湖泛起|涟漪|嘴角微微上扬|眼中闪过一丝|带着.{0,6}的口吻/],
  ['八股·情绪套话', /陷入极大的恐惧|万念俱灰|心头一震|心中一凛|不由自主地|不禁/],
  // ── 句式黑名单 ──
  ['句式·否定转折', /不是[^，。]{1,20}，而是/],
  ['句式·过度心理', /他心想|她心想|心中暗道|暗自思忖|内心深处/],
  // ── 元叙事 ──
  ['元叙事', /本文将|本条目|如前所述|综上所述|值得注意的是|需要指出的是|本条目的作用/],
  // ── 翻译腔 ──
  ['翻译腔', /一个.{0,6}的存在|进行了一次|做出了一个|作为一个.{0,8}的存在/],
  // ── 待考/占位符 ──
  ['占位符', /待补|待确认|TODO|FIXME|XXX|（略）|\(略\)/],
];

const exts = ['.yaml', '.md', '.txt'];
const files = [];
const ROOTS = ['世界书', '开场白', '正则', '脚本'];
for (const r of ROOTS) {
  const d = path.join(root, r);
  if (!fs.existsSync(d)) continue;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (exts.includes(path.extname(e.name))) files.push(p);
    }
  })(d);
}

let hit = 0;
const byRule = new Map();
for (const p of files) {
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  // 参考语料是原文逐字引用，属于不可改写的素材，与规则说明块同样豁免
  let refIndent = -1;
  const inRefBlock = (line, i) => {
    const t = line.replace(/\s+$/, '');
    if (/^\s*参考语料:\s*$/.test(t)) { refIndent = t.length - t.trimStart().length; return true; }
    if (refIndent >= 0) {
      if (t.trim() === '') return true;
      const ind = t.length - t.trimStart().length;
      if (ind > refIndent) return true;
      refIndent = -1;
    }
    return false;
  };
  for (const [name, re] of RULES) {
    refIndent = -1;
    lines.forEach((line, i) => {
      const exempt = inRefBlock(line, i);
      // 允许在规则说明/自检块中列举禁词
      if (/禁用词|黑名单|红线|违规|禁止出现/.test(line)) return;
      if (exempt) return;
      const m = line.match(re);
      if (!m) return;
      hit++;
      byRule.set(name, (byRule.get(name) || 0) + 1);
      console.log(`${name.padEnd(14)} ${path.relative(root, p)}:${i + 1}  「${m[0]}」`);
      console.log(`               ${line.trim().slice(0, 130)}`);
    });
  }
}
console.log(`\n扫描 ${files.length} 个文件，命中 ${hit} 处`);
if (byRule.size) for (const [k, v] of [...byRule].sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
