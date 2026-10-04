// 只打印「泄露行」本身，便于逐条裁定。
import fs from 'fs';
import path from 'path';
const R = 'src/兽血沸腾/世界书/时间线';

// 真正的后期剧透标记（排除主角名/领地名这类随时可见的词）
const LEAK = [
  // 终盘专属
  '茵格里切宝', '介丘', '被遗忘国度', '遗忘历', '刘抗美', '太子诞', '胡须迎客',
  '幕后黑手', '幻境送回', '大结局',
  // 终盘人物
  '小空', '小净',
  // 卢塞恩改名（终盘才发生）
  '卢塞恩',
  // 中后期才出现的身份/事件
  '神曲萨满', '神曲光环', '神曲',
  '太子', '左岸天王',
  // 后期人物登场
  '嘉宝', '梦露', '贞德',
];

const files = fs.readdirSync(R).filter(f => f.endsWith('.yaml')).sort();
for (const f of files) {
  const lines = fs.readFileSync(path.join(R, f), 'utf8').split('\n');
  if (lines[0].startsWith('@@')) continue;
  const hits = [];
  lines.forEach((l, i) => {
    const ms = LEAK.filter(k => l.includes(k));
    if (ms.length) hits.push({ i: i + 1, l: l.trim(), ms });
  });
  if (!hits.length) continue;
  console.log(`\n══ ${f} ══`);
  for (const h of hits) console.log(`  L${String(h.i).padStart(4)} [${h.ms.join(',')}] ${h.l.slice(0, 150)}`);
}
