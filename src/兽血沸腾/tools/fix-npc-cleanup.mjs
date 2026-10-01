// 收尾：① 姓名里的群像组名别名 ② 唐藏亲王 → 四殿下（原文证明为苦行僧侣）③ 删普斯卡什大师.yaml
import fs from 'fs';
import path from 'path';
const NPC = 'src/兽血沸腾/世界书/NPC';
const BK = 'src/兽血沸腾/tools/_npc-backup';

// 20 个群像组名（已被删，从备份收集）
const GROUPS = fs.readdirSync(BK).filter(f => f.endsWith('.yaml'))
  .filter(f => /^  成员:\s*$/m.test(fs.readFileSync(path.join(BK, f), 'utf8')))
  .map(f => f.replace(/\.yaml$/, ''));
console.log('群像组名:', GROUPS.join('、'), '\n');

let fixed = 0;
for (const f of fs.readdirSync(NPC).filter(x => x.endsWith('.yaml'))) {
  const p = path.join(NPC, f);
  let t = fs.readFileSync(p, 'utf8');
  const m = t.match(/^  姓名: (.*)$/m);
  if (!m) continue;
  let name = m[1].trim();
  if (!name.includes('又称')) continue;
  const [main, ...aliases] = name.replace(/^["']|["']$/g, '').split('又称');
  const keep = aliases.join('又称').split('、').map(s => s.trim())
    .filter(a => a && !GROUPS.includes(a) && !GROUPS.some(g => a.includes(g)));
  const newName = keep.length ? `${main.trim()}，又称${keep.join('、')}` : main.trim();
  t = t.replace(/^  姓名: .*$/m, `  姓名: ${newName}`);
  fs.writeFileSync(p, t, 'utf8');
  console.log(`  ${f.replace('.yaml', '')}: 「${name}」→「${newName}」`);
  fixed++;
}
console.log(`\n姓名别名修正 ${fixed} 处`);

// 唐藏亲王 → 四殿下
// 注意：下面写出的 `姓名:` 行是**原文散文形态**（`通称玄奥的壮汉殿下` 原文 39 次），
// 保留即可。旧版 `make-npc-patch.mjs` 会把整行塞进 keywords 造成幽灵词，
// 现已改为用 `namesFrom()` 按 `全名|通称|又称|又写作|绰号|别名|小名` 分段取值，散文形态不再有害。
const from = path.join(NPC, '唐藏亲王.yaml');
if (fs.existsSync(from)) {
  let t = fs.readFileSync(from, 'utf8');
  t = t.replace(/^  姓名: .*$/m, '  姓名: 四殿下，通称玄奥的壮汉殿下');
  t = t.replace(/^  身份: .*$/m,
    '  身份: 唐藏帝国四殿下，唐藏国王的弟弟，半路出家的苦行僧侣，以托钵与金环杖行游大陆，在墨晶峡谷被刘震撼与维埃里从黑暗精灵手中救出');
  // 群像把「五殿下」写进了这位的条目，剥离该错误自称
  t = t.replace(/^  说话风格: .*$/m, (s) => s.replace(/自称小王[；;]?/, ''));
  t = t.replace(/^  关系: .*$/m, '  关系: 唐藏帝国派到爱琴的皇室代表，小空与小净的师父，五殿下冬五的四哥');
  t = t.replace(/^  态度: .*$/m, (s) => s.replace(/^  态度: .*$/, '  态度: 认定刘震撼修成金刚琉璃身，见面便要下拜；也当面点破小空与刘震撼花王花将一体共生的缘分'));
  fs.writeFileSync(path.join(NPC, '四殿下.yaml'), t, 'utf8');
  fs.unlinkSync(from);
  console.log('唐藏亲王.yaml → 四殿下.yaml（姓名/身份按原文 L99212-99214、L10922 改写）');
}

// 删普斯卡什大师.yaml（用户裁定：已有 角色/普斯卡什 专条）
const pk = path.join(NPC, '普斯卡什大师.yaml');
if (fs.existsSync(pk)) { fs.unlinkSync(pk); console.log('已删 普斯卡什大师.yaml'); }

console.log(`\nNPC 文件数: ${fs.readdirSync(NPC).filter(f => f.endsWith('.yaml')).length}`);
