import fs from 'fs';
const txt = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const lines = txt.split('\n');

// 1) 验证性别：紧邻窗口内 她/他 计数 + 身份词
const CHECK = ['加茜娅', '卡提比', '依莎贝拉', '米娅', '巴克蒂亚萨德赫', '幽月儿', '费雯丽', '珍妮佛', '波姬小丝', '青雅.白玉', '勃郎宁', '巢农主母', '赫莲娜', '朝河兰', '伦娜'];
console.log('══ 性别核验（±16 字窗口）══');
for (const n of CHECK) {
  let she = 0, he = 0;
  for (const l of lines) {
    let i = l.indexOf(n);
    while (i >= 0) {
      const w = l.slice(Math.max(0, i - 16), i + n.length + 16);
      she += (w.match(/她/g) || []).length; he += (w.match(/他/g) || []).length;
      i = l.indexOf(n, i + 1);
    }
  }
  console.log(`  ${n.padEnd(14)} 她 ${String(she).padStart(3)}  他 ${String(he).padStart(3)}  → ${she > he ? '女' : he > she ? '男' : '?'}`);
}

// 2) 无引号开口的对话行（原文常见缺前引号）
console.log('\n══ 缺前引号的对话（示范）══');
for (const n of ['巴克蒂亚萨德赫', '杰拉德', '依莎贝拉', '米娅', '冰肌仙子', '含香仙子']) {
  const h = [];
  lines.forEach((l, i) => { if (l.includes(n)) h.push(i); });
  console.log(`\n--- ${n} (${h.length} 行) ---`);
  h.slice(0, 3).forEach(i => console.log(`  L${i + 1}: ${lines[i].trim().slice(0, 200)}`));
}
