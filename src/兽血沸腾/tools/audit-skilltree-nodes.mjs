// 核验技能树面板里的节点名是否原文有据（战歌/兵种/科技/异体）。
import fs from 'fs';

const p = 'src/兽血沸腾/界面/状态栏/components/SkillTreePanel.vue';
const t = fs.readFileSync(p, 'utf8');
const 原 = fs.readFileSync('src/兽血沸腾/兽血沸腾.txt', 'utf8');
const 有 = s => 原.includes(s);

// 抓取引号里的中文节点名
const 名 = new Set();
for (const m of t.matchAll(/['"]([\u4e00-\u9fa5·]{2,16})['"]/g)) 名.add(m[1]);
for (const m of t.matchAll(/(?:name|label|title|歌|技|术)\s*:\s*['"]([\u4e00-\u9fa5·]{2,16})['"]/g)) 名.add(m[1]);

const 列表 = [...名].filter(x => !/^(总览|战斗|技能树|领地|角色|剧情|魔宠|装备|后宫|自定义|状态|记录|说明)$/.test(x));
const 缺 = 列表.filter(x => !有(x));

console.log(`══ SkillTreePanel 里提取中文串 ${列表.length} 个，原文 0 命中 ${缺.length} 个 ══\n`);
console.log('── 原文 0 命中（逐个判定）──');
for (const w of 缺.sort((a, b) => a.length - b.length)) console.log(`   「${w}」`);
console.log('\n── 原文有据的节点名（前 60）──');
console.log('   ' + 列表.filter(有).slice(0, 60).join(' · '));
