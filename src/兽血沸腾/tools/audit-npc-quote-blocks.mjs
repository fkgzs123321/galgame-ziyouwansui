// 结构体检：语料被清空后，文件里不得残留空的「参考语料:」头
import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
let bad = 0;
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml'))) {
  const t = fs.readFileSync(path.join(NPC, f), 'utf8');
  // 空头：参考语料: 后面没有 "- " 行
  const m = t.match(/^  参考语料:[ \t]*$/m);
  if (m) {
    const after = t.slice(m.index + m[0].length + 1);
    if (!/^    - /m.test(after.split(/\n(?=\S)/)[0] || '')) {
      console.log(`✗ 空语料头: ${f}`); bad++;
    }
  }
  if (/\n{3,}/.test(t)) { console.log(`✗ 连续空行: ${f}`); bad++; }
  if (!/^  参考语料:/m.test(t) && !/^  说话风格:/m.test(t)) { console.log(`✗ 缺语言特征: ${f}`); bad++; }
}
console.log(bad === 0 ? '✓ 113 个 NPC 文件语料块结构合规' : `✗ ${bad} 处异常`);
