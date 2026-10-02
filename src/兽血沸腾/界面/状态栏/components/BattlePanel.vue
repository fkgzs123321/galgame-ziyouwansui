<template>
  <div>
    <!-- 未开战 -->
    <div v-if="!战斗.进行中" class="sb-sec">
      <div class="sb-sec-title">战斗面板 · 当前无战事</div>
      <div class="sb-empty">战斗未开始。触发战斗后本面板会自动抢占前台。</div>
      <div v-if="战报列表.length" style="margin-top: 8px">
        <div class="sb-sec-title">上一场战报</div>
        <div class="sb-scroll" style="max-height: 200px">
          <div v-for="r in 战报列表" :key="r.名称" class="logline sb-dim">
            <span class="sb-num">[{{ r.名称 }}]</span> {{ r.摘要 }}
          </div>
        </div>
      </div>
      <div class="ctl" style="margin-top: 8px">
        <button class="sb-btn sb-btn-song" @click="开始战斗">
          <i class="fa-solid fa-khanda" /> 开始战斗
        </button>
        <button class="sb-btn sb-btn-life" :disabled="!战报列表.length" @click="清空战报">
          <i class="fa-solid fa-eraser" /> 清空战报
        </button>
      </div>
    </div>

    <template v-else>
      <!-- 环境条 -->
      <div class="sb-sec">
        <div class="sb-sec-title">
          战场环境 · 第 {{ 战斗.回合 }} 回合 · {{ 战斗.阶段 }}
          <span v-if="is_war" class="sb-tag sb-tag-life">交战</span>
        </div>
        <div class="env-row">
          <span class="sb-tag">地形：{{ 战斗.环境.地形 }}</span>
          <span class="sb-tag">天气：{{ 战斗.环境.天气 }}</span>
          <span
            v-for="b in 结界列表"
            :key="b.名称"
            class="sb-tag sb-tag-song"
            :title="b.效果"
          >
            结界：{{ b.名称 }}
            <template v-if="b.范围">（{{ b.范围 }}）</template>
          </span>
          <span v-if="!结界列表.length" class="sb-tag">无结界</span>
        </div>

        <!-- 阶段推进：只按 schema 枚举走，不允许任意文本 -->
        <div class="ctl" style="margin-top: 6px">
          <span class="sb-dim" style="align-self: center; font-size: 11px">阶段</span>
          <button
            v-for="s in STAGES"
            :key="s"
            class="sb-btn"
            :class="{ on: 战斗.阶段 === s }"
            @click="设阶段(s)"
          >
            {{ s }}
          </button>
          <button class="sb-btn sb-btn-song" @click="下一阶段">
            <i class="fa-solid fa-angles-right" /> 推进阶段
          </button>
        </div>

        <!-- 结界增删：键名为 施放者 + 效果，避免同名互相覆盖 -->
        <details class="fold" style="margin-top: 6px">
          <summary class="sb-dim" style="cursor: pointer; font-size: 11px">结界增删</summary>
          <div class="form">
            <input v-model="结界表单.施放者" class="ipt" placeholder="施放者" />
            <input v-model="结界表单.范围" class="ipt" placeholder="范围" />
            <input v-model="结界表单.效果" class="ipt wide" placeholder="效果" />
            <button class="sb-btn sb-btn-song" :disabled="!结界表单.施放者.trim()" @click="新增结界">
              新增结界
            </button>
          </div>
          <div v-if="结界列表.length" class="del-list">
            <span v-for="b in 结界列表" :key="b.名称" class="sb-tag sb-tag-song">
              {{ b.名称 }}
              <button class="x" title="移除" @click="删结界(b.名称)">×</button>
            </span>
          </div>
          <div v-else class="sb-empty">无结界可删。</div>
        </details>
      </div>

      <!-- 战歌加持槽 -->
      <div class="sb-sec">
        <div class="sb-sec-title">
          战歌加持槽
          <span class="sb-dim">同类加持不叠加，取最高值</span>
        </div>
        <div v-if="!加持列表.length" class="sb-empty">当前无战歌光环生效。</div>
        <div v-else class="aura-list">
          <div v-for="a in 加持列表" :key="a.名称" class="sb-aura">
            <b>{{ a.名称 }}</b>
            <span class="sb-dim" style="margin-left: 6px">施法者：{{ a.施法者 || '—' }}</span>
            <span class="sb-tag sb-tag-song" style="margin-left: 6px">
              剩余 {{ a.剩余时限 || '—' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 单位卡 -->
      <div class="sb-sec">
        <div class="sb-sec-title">我方单位 · {{ 我方列表.length }}</div>
        <div class="units">
          <div v-for="u in 我方列表" :key="u.名称" class="unit mine">
            <div class="uhead">
              <b>{{ u.名称 }}</b>
              <span class="sb-tag">{{ u.兵种 || '—' }}</span>
              <span class="sb-dim" style="font-size: 11px">{{ u.站位 }}</span>
              <button class="x" title="移除单位" @click="删单位('我方', u.名称)">×</button>
            </div>
            <div class="sb-num">生命 {{ u.生命 }}</div>
            <div class="st">
              <span v-for="s in 标签(u.状态)" :key="s" class="sb-tag sb-tag-song">{{ s }}</span>
            </div>
            <div v-if="u.属性" class="sb-dim" style="font-size: 11px; margin-top: 4px">
              力 {{ u.属性.力量 ?? 0 }} · 敏 {{ u.属性.敏捷 ?? 0 }} · 体 {{ u.属性.体质 ?? 0 }} · 感 {{ u.属性.感知 ?? 0 }} · 甲 {{ u.属性.护甲 ?? 0 }} · 魔强 {{ u.属性.魔法强度 ?? 0 }}
            </div>
            <div v-if="列(u.技能).length" style="margin-top: 4px">
              <span v-for="sk in 列(u.技能)" :key="sk.名称" class="sb-tag" :title="sk.效果">{{ sk.名称 }}</span>
            </div>
          </div>
          <div v-if="!我方列表.length" class="sb-empty">无我方单位记录。</div>
        </div>
        <details class="fold" style="margin-top: 6px">
          <summary class="sb-dim" style="cursor: pointer; font-size: 11px">新增我方单位</summary>
          <div class="form">
            <input v-model="我表单.名" class="ipt" placeholder="单位名" />
            <input v-model="我表单.兵种" class="ipt" placeholder="兵种" />
            <input v-model.number="我表单.生命" type="number" class="ipt num" placeholder="生命" />
            <input v-model="我表单.站位" class="ipt" placeholder="站位" />
            <input v-model="我表单.状态" class="ipt" placeholder="状态" />
            <input v-model.number="我表单.力量" type="number" class="ipt num" placeholder="力量" />
            <input v-model.number="我表单.敏捷" type="number" class="ipt num" placeholder="敏捷" />
            <input v-model.number="我表单.体质" type="number" class="ipt num" placeholder="体质" />
            <input v-model.number="我表单.护甲" type="number" class="ipt num" placeholder="护甲" />
            <input v-model.number="我表单.魔法强度" type="number" class="ipt num" placeholder="魔法强度" />
            <input v-model.number="我表单.感知" type="number" class="ipt num" placeholder="感知" />
            <button class="sb-btn sb-btn-song" :disabled="!我表单.名.trim()" @click="新增单位('我方')">
              新增
            </button>
          </div>
        </details>
      </div>

      <div class="sb-sec">
        <div class="sb-sec-title">敌方单位 · {{ 敌方列表.length }}</div>
        <div class="units">
          <div v-for="u in 敌方列表" :key="u.名称" class="unit foe">
            <div class="uhead">
              <b>{{ u.名称 }}</b>
              <span class="sb-tag sb-tag-life">{{ u.兵种 || '—' }}</span>
              <span class="sb-dim" style="font-size: 11px">{{ u.站位 }}</span>
              <button class="x" title="移除单位" @click="删单位('敌方', u.名称)">×</button>
            </div>
            <div class="sb-num">生命 {{ u.生命 }}</div>
            <div class="st">
              <span v-for="s in 标签(u.状态)" :key="s" class="sb-tag sb-tag-life">{{ s }}</span>
            </div>
            <div v-if="u.属性" class="sb-dim" style="font-size: 11px; margin-top: 4px">
              力 {{ u.属性.力量 ?? 0 }} · 敏 {{ u.属性.敏捷 ?? 0 }} · 体 {{ u.属性.体质 ?? 0 }} · 感 {{ u.属性.感知 ?? 0 }} · 甲 {{ u.属性.护甲 ?? 0 }} · 魔强 {{ u.属性.魔法强度 ?? 0 }}
            </div>
            <div v-if="列(u.技能).length" style="margin-top: 4px">
              <span v-for="sk in 列(u.技能)" :key="sk.名称" class="sb-tag" :title="sk.效果">{{ sk.名称 }}</span>
            </div>
          </div>
          <div v-if="!敌方列表.length" class="sb-empty">无敌方单位记录。</div>
        </div>
        <details class="fold" style="margin-top: 6px">
          <summary class="sb-dim" style="cursor: pointer; font-size: 11px">新增敌方单位</summary>
          <div class="form">
            <input v-model="敌表单.名" class="ipt" placeholder="单位名" />
            <input v-model="敌表单.兵种" class="ipt" placeholder="兵种" />
            <input v-model.number="敌表单.生命" type="number" class="ipt num" placeholder="生命" />
            <input v-model="敌表单.站位" class="ipt" placeholder="站位" />
            <input v-model="敌表单.状态" class="ipt" placeholder="状态" />
            <input v-model.number="敌表单.力量" type="number" class="ipt num" placeholder="力量" />
            <input v-model.number="敌表单.敏捷" type="number" class="ipt num" placeholder="敏捷" />
            <input v-model.number="敌表单.体质" type="number" class="ipt num" placeholder="体质" />
            <input v-model.number="敌表单.护甲" type="number" class="ipt num" placeholder="护甲" />
            <input v-model.number="敌表单.魔法强度" type="number" class="ipt num" placeholder="魔法强度" />
            <input v-model.number="敌表单.感知" type="number" class="ipt num" placeholder="感知" />
            <button class="sb-btn sb-btn-life" :disabled="!敌表单.名.trim()" @click="新增单位('敌方')">
              新增
            </button>
          </div>
        </details>
      </div>

      <!-- 结算控制 -->
      <div class="sb-sec">
        <div class="sb-sec-title">
          结算控制
          <span class="sb-dim">前端主导结算，AI 只负责描写，不得改动已算定的数值</span>
        </div>
        <div class="ctl">
          <button class="sb-btn sb-btn-song" @click="下一回合">
            <i class="fa-solid fa-forward" /> 推进一回合
          </button>
          <button class="sb-btn" @click="结算('我方')">
            <i class="fa-solid fa-calculator" /> 结算我方行动
          </button>
          <button class="sb-btn" @click="结算('敌方')">
            <i class="fa-solid fa-calculator" /> 结算敌方行动
          </button>
          <button class="sb-btn sb-btn-life" @click="结束战斗">
            <i class="fa-solid fa-flag-checkered" /> 结束战斗
          </button>
        </div>
        <div class="rules sb-dim">
          命中＝攻方敏捷对守方敏捷（地形与天气修正）· 伤害＝攻方力量或魔法强度减守方体质与护甲，再乘战歌与结界修正 ·
          兵种克制：长枪与拒马克制骑兵冲锋、远程投掷克制密集步兵方阵、巨兽重装克制轻装步兵、空军克制无防空地面部队 ·
          战歌加持属增益，不受魔法免疫影响
        </div>
      </div>

      <!-- 战报回放 -->
      <div class="sb-sec">
        <div class="sb-sec-title">
          战报回放 · {{ 战报列表.length }} 条
          <button class="sb-btn sb-btn-life" style="margin-left: auto" :disabled="!战报列表.length" @click="清空战报">
            <i class="fa-solid fa-eraser" /> 清空战报
          </button>
        </div>
        <div class="sb-scroll">
          <div v-for="r in 战报列表" :key="r.名称" class="logline">
            <span class="sb-num sb-dim">[{{ r.名称 }}]</span> {{ r.摘要 }}
            <div v-if="r.我方损失 || r.敌方损失" class="sb-dim" style="font-size: 11px">
              <template v-if="r.我方损失">我方 {{ r.我方损失 }}</template>
              <template v-if="r.我方损失 && r.敌方损失"> · </template>
              <template v-if="r.敌方损失">敌方 {{ r.敌方损失 }}</template>
            </div>
          </div>
          <div v-if="!战报列表.length" class="sb-empty">本场战斗尚无记录。</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../../store';
import { 列, 标签 } from '../../工具';

const store = useDataStore();
const { 战斗 } = store.data;

const is_war = computed(() => 战斗.进行中 === true);

// 阶段枚举必须与 schema 一致，推进与直接跳转都只走这些值
const STAGES = ['未开始', '布阵', '交锋', '鏖战', '追击', '撤退', '结算'] as const;
type 阶段 = (typeof STAGES)[number];

// 结界/单位的新增表单留空即不写入，避免脏键
const 结界表单 = ref({ 施放者: '', 范围: '', 效果: '' });
const 我表单 = ref({ 名: '', 兵种: '', 生命: 0, 站位: '', 状态: '', 力量: 0, 敏捷: 0, 体质: 0, 感知: 0, 护甲: 0, 魔法强度: 0 });
const 敌表单 = ref({ 名: '', 兵种: '', 生命: 0, 站位: '', 状态: '', 力量: 0, 敏捷: 0, 体质: 0, 感知: 0, 护甲: 0, 魔法强度: 0 });

const 结界列表 = computed(() => 列(战斗.环境.结界));
const 加持列表 = computed(() => 列(战斗.战歌加持));
const 我方列表 = computed(() => 列(战斗.我方));
const 敌方列表 = computed(() => 列(战斗.敌方));
// 按回合序排，让回放和时间线一致；键名里的数字要按数值比，否则「第10回合」会排到「第2回合」前面
const 序号 = (s: unknown) => String(s).match(/\d+/g)?.map(Number) ?? [];
const 战报列表 = computed(() =>
  列(战斗.战报, '名称').sort((a, b) => {
    const x = 序号(a.名称);
    const y = 序号(b.名称);
    for (let i = 0; i < Math.max(x.length, y.length); i += 1) {
      const d = (x[i] ?? 0) - (y[i] ?? 0);
      if (d) return d;
    }
    return String(a.名称).localeCompare(String(b.名称), 'zh');
  }),
);

/** 战报是 record，追加时按「回合-序号」生成唯一键，不覆盖已有记录 */
function log(text: string, 损失?: { 我方?: string; 敌方?: string }) {
  const 前缀 = `第${战斗.回合}回合`;
  let i = 1;
  while (战斗.战报[`${前缀}-${i}`]) i += 1;
  战斗.战报[`${前缀}-${i}`] = {
    摘要: text,
    我方损失: 损失?.我方 ?? '',
    敌方损失: 损失?.敌方 ?? '',
  };
}

function 下一回合() {
  战斗.回合 += 1;
  // 战歌加持按时长递减，归零即消散（原作：被打断则凝聚的歌力瞬间失效）
  for (const [名, a] of Object.entries(战斗.战歌加持)) {
    const n = Number(String(a.剩余时限).replace(/[^\d]/g, ''));
    if (!n) continue;
    if (n > 1) a.剩余时限 = String(n - 1);
    else {
      delete 战斗.战歌加持[名];
      log(`${名} 的光环时限耗尽，加持消散。`);
    }
  }
  log(`进入第 ${战斗.回合} 回合。`);
}

// 前端结算入口：只算数值并写战报，由 AI 依战报写成正文
function 结算(side: '我方' | '敌方') {
  const atk = side === '我方' ? 我方列表.value : 敌方列表.value;
  const def = side === '我方' ? 敌方列表.value : 我方列表.value;
  if (!atk.length || !def.length) {
    log(`${side}结算缺少单位数据。`);
    return;
  }
  log(`触发${side}行动结算（数值由前端算定，叙述不得改动）。`);
}

function 结束战斗() {
  战斗.进行中 = false;
  战斗.阶段 = '结算';
  log('战斗结束，进入结算。');
}

function 开始战斗() {
  战斗.进行中 = true;
  战斗.阶段 = '布阵';
  if (!战斗.回合) 战斗.回合 = 1;
  log('战斗开始，进入布阵阶段。');
}

/** 阶段推进按 schema 顺序单向前进，末态停在「结算」 */
function 下一阶段() {
  const i = STAGES.indexOf(战斗.阶段 as 阶段);
  const next = STAGES[Math.min(STAGES.length - 1, (i < 0 ? 0 : i) + 1)];
  if (next === 战斗.阶段) {
    log('已处于结算阶段，无法继续推进。');
    return;
  }
  设阶段(next);
}

function 设阶段(s: string) {
  if (战斗.阶段 === s) return;
  战斗.阶段 = s as 阶段;
  // 进入结算即视为战事收束，与 结束战斗() 的语义保持一致
  if (s === '结算') 战斗.进行中 = false;
  log(`阶段推进为「${s}」。`);
}

function 新增单位(side: '我方' | '敌方') {
  const f = side === '我方' ? 我表单.value : 敌表单.value;
  const 名 = f.名.trim();
  if (!名) return;
  const 容器 = side === '我方' ? 战斗.我方 : 战斗.敌方;
  if (容器[名]) {
    log(`${side}已有同名单位「${名}」，未新增。`);
    return;
  }
  容器[名] = {
    兵种: f.兵种.trim(),
    生命: Math.max(0, Math.min(999999, Number(f.生命) || 0)),
    状态: f.状态.trim(),
    站位: f.站位.trim(),
    属性: {
      力量: Math.max(0, Number(f.力量) || 0),
      敏捷: Math.max(0, Number(f.敏捷) || 0),
      体质: Math.max(0, Number(f.体质) || 0),
      感知: Math.max(0, Number(f.感知) || 0),
      护甲: Math.max(0, Number(f.护甲) || 0),
      魔法强度: Math.max(0, Number(f.魔法强度) || 0),
    },
    技能: {},
  };
  log(`${side}新增单位「${名}」。`);
  f.名 = '';
  f.兵种 = '';
  f.生命 = 0;
  f.站位 = '';
  f.状态 = '';
}

function 删单位(side: '我方' | '敌方', 名: string) {
  delete (side === '我方' ? 战斗.我方 : 战斗.敌方)[名];
  log(`${side}移除单位「${名}」。`);
}

/** 结界键名带上施放者，避免同一效果被不同人施放时互相覆盖 */
function 结界键() {
  const f = 结界表单.value;
  const 基 = f.范围.trim() ? `${f.施放者.trim()}-${f.范围.trim()}` : f.施放者.trim();
  let 键名 = 基;
  let i = 2;
  while (战斗.环境.结界[键名]) 键名 = `${基}(${i++})`;
  return 键名;
}

function 新增结界() {
  const f = 结界表单.value;
  if (!f.施放者.trim()) return;
  const 键名 = 结界键();
  战斗.环境.结界[键名] = { 施放者: f.施放者.trim(), 范围: f.范围.trim(), 效果: f.效果.trim() };
  log(`新增结界「${键名}」。`);
  f.施放者 = '';
  f.范围 = '';
  f.效果 = '';
}

function 删结界(键名: string) {
  const b = 战斗.环境.结界[键名];
  delete 战斗.环境.结界[键名];
  log(`解除结界「${b?.施放者 || 键名}」。`);
}

/** 清空战报用 delete 逐键删，保持 record 引用不变；清空本身不留痕，否则永远清不干净 */
function 清空战报() {
  for (const k of Object.keys(战斗.战报)) delete 战斗.战报[k];
}
</script>

<style lang="scss" scoped>
.env-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.aura-list {
  display: grid;
  gap: 5px;
}

.units {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 6px;
}

.unit {
  border: 1px solid var(--sb-line);
  background: var(--sb-bg);
  padding: 5px 6px;
}

.unit.mine {
  border-left: 2px solid var(--sb-song);
}

.unit.foe {
  border-left: 2px solid var(--sb-life);
}

.uhead {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.st {
  margin-top: 3px;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.ctl {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.rules {
  margin-top: 7px;
  font-size: 11px;
  border-top: 1px dashed var(--sb-line);
  padding-top: 5px;
}

.logline {
  font-size: 12px;
  padding: 2px 0;
  border-bottom: 1px dotted var(--sb-line);
}

/* 表单与删除按钮沿用全局配色，仅补布局 */
.form {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.ipt {
  background: #0d0b08;
  border: 1px solid var(--sb-line);
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 12px;
  padding: 2px 5px;
  min-width: 0;
  flex: 1 1 88px;
}

.ipt.num {
  flex: 0 0 70px;
}

.ipt.wide {
  flex: 1 1 160px;
}

.ipt:focus {
  outline: none;
  border-color: var(--sb-song);
}

.ctl .sb-btn.on {
  border-color: var(--sb-song);
  color: var(--sb-song);
}

.x {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--sb-dim);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 0 2px;
}

.x:hover {
  color: var(--sb-life);
}

.del-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 5px;
}

.fold summary {
  list-style: none;
}

.fold summary::-webkit-details-marker {
  display: none;
}

.fold summary::before {
  content: '\25B8';
  margin-right: 4px;
}

.fold[open] summary::before {
  content: '\25BE';
}
</style>
