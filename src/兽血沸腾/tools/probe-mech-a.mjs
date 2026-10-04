// 机制验证：Shape A 条目（contents 首片段 @@if 开门）的文件正文里放 <%_ %> 分支，
// 走真实 forge 流程，看 unpack / 卡片产物里两段是否都原样存活、且不互相干扰。
// 结论只用于确认可行性；验证后立即回滚该条目。
import fs from 'fs';
import { execFileSync } from 'child_process';

const PROJ = 'src/兽血沸腾';
const KEY = '角色/海伦.列娜_基础信息';
const st0 = JSON.parse(fs.readFileSync(`${PROJ}/tavern-cards-state.json`, 'utf8'));
if (!st0.entryManifest.角色[KEY]) { console.error('条目不存在'); process.exit(1); }
console.log('原条目 keys:', Object.keys(st0.entryManifest.角色[KEY]).join(','));
console.log('原 contents[0]:', JSON.stringify(st0.entryManifest.角色[KEY].contents?.[0]).slice(0, 160));
