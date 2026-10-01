<template>
  <div>
    <!-- 四项体验进度 -->
    <div class="sb-sec">
      <div class="sb-sec-title">四项体验进度</div>
      <div class="exp-grid">
        <div v-for="e in exps" :key="e.name" class="exp">
          <div class="exp-head">
            <i class="fa-solid" :class="e.icon" />
            <span>{{ e.name }}</span>
            <span class="sb-num sb-dim">{{ e.value }}%</span>
          </div>
          <div class="sb-bar" :class="e.cls">
            <i :style="{ width: `${e.value}%` }" />
          </div>
          <div class="sb-dim exp-note">{{ e.note }}</div>
        </div>
      </div>
    </div>

    <!-- 属性六维 -->
    <div class="sb-sec">
      <div class="sb-sec-title">属性 · 六维</div>
      <div class="attrs">
        <div v-for="(v, k) in 主角.属性" :key="k" class="attr">
          <span class="k">{{ k }}</span>
          <div class="sb-bar sb-bar-song"><i :style="{ width: `${Math.min(100, Number(v) * 4)}%` }" /></div>
          <span class="sb-num v">{{ v }}</span>
        </div>
      </div>
      <div class="sb-dim hint">
        力量影响近战伤害与负重 · 敏捷影响先攻与闪避 · 体质影响生命上限与抗性 · 智慧影响魔法效果与战术判定 ·
        歌力影响战歌数量范围与持续时间 · 魅力影响士气招揽与社交
      </div>
    </div>

    <!-- 状态与事务 -->
    <div class="sb-sec">
      <div class="sb-sec-title">当前状态与近期事务</div>
      <div class="kv">
        <div><span class="sb-dim">扮演</span>{{ 主角.名称 || '<user>' }}</div>
        <div><span class="sb-dim">身份</span>{{ 主角.身份 }}</div>
        <div><span class="sb-dim">阶位</span>{{ 主角.阶位 }}</div>
        <div><span class="sb-dim">阵营声望</span>{{ 声望摘要 }}</div>
        <div><span class="sb-dim">淫乱度</span><span class="sb-num">{{ 主角.淫乱度 }}</span></div>
        <div><span class="sb-dim">精力</span><span class="sb-num">{{ 主角.精力 }}</span></div>
      </div>
      <div class="st-row">
        <span v-if="!状态列表.length" class="sb-dim">无特殊状态</span>
        <span v-for="s in 状态列表" :key="s.名称" class="sb-tag sb-tag-song" :title="状态说明(s)">
          {{ s.名称 }}
        </span>
        <span v-if="诅咒开" class="sb-tag sb-tag-life">血之祭奠（正牌战歌失效）</span>
      </div>
      <div class="matter">
        <span v-if="!事务列表.length" class="sb-dim">暂无事务记录</span>
        <span v-for="m in 事务列表" :key="m.名称" class="sb-tag" :title="m.说明">{{ m.名称 }}</span>
      </div>

      <!-- 主角.状态 增删：键名为状态名 -->
      <details class="fold" style="margin-top: 6px">
        <summary class="sb-dim" style="cursor: pointer; font-size: 11px">状态增删</summary>
        <div v-if="状态列表.length" class="del-list">
          <span v-for="s in 状态列表" :key="s.名称" class="sb-tag sb-tag-song">
            {{ s.名称 }}
            <button class="x" title="移除" @click="删状态(s.名称)">×</button>
          </span>
        </div>
        <div v-else class="sb-empty">无状态可删。</div>
        <div class="form">
          <input v-model="状态表单.名" class="ipt" placeholder="状态名" />
          <select v-model="状态表单.类型" class="ipt">
            <option v-for="t in 状态类型" :key="t" :value="t">{{ t }}</option>
          </select>
          <input v-model="状态表单.来源" class="ipt" placeholder="来源" />
          <input v-model="状态表单.剩余时限" class="ipt" placeholder="剩余时限" />
          <button class="sb-btn sb-btn-song" :disabled="!状态表单.名.trim()" @click="新增状态">
            新增状态
          </button>
        </div>
      </details>
    </div>

    <!-- 系统设置：难度 / 规则开关 / 玩家自定义 -->
    <div class="sb-sec">
      <div class="sb-sec-title">系统 · 难度</div>
      <div class="ctl">
        <button
          v-for="d in 难度表"
          :key="d"
          class="sb-btn"
          :class="{ on: 系统.难度 === d }"
          @click="设难度(d)"
        >
          {{ d }}
        </button>
      </div>

      <div class="sb-sec-title" style="margin-top: 8px">规则开关</div>
      <div class="rules">
        <button
          v-for="k in 开关键"
          :key="k"
          class="sb-btn"
          :class="系统.规则开关[k] !== false ? 'sb-btn-terra' : 'sb-btn-life'"
          @click="翻转开关(k)"
        >
          <i class="fa-solid" :class="系统.规则开关[k] !== false ? 'fa-toggle-on' : 'fa-toggle-off'" />
          {{ k }} · {{ 系统.规则开关[k] !== false ? '开' : '关' }}
        </button>
      </div>

      <div class="sb-sec-title" style="margin-top: 8px">玩家自定义 · {{ 自定义列表.length }} 项</div>
      <table v-if="自定义列表.length" class="sb-tb">
        <tbody>
          <tr v-for="c in 自定义列表" :key="c.键">
            <th style="width: 34%">{{ c.键 }}</th>
            <td>{{ c.值 }}</td>
            <td style="width: 8%">
              <button class="x" title="删除" @click="删自定义(c.键)">×</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="sb-empty">尚无自定义条目。</div>
      <div class="form">
        <input v-model="自定义表单.键" class="ipt" placeholder="键" />
        <input v-model="自定义表单.值" class="ipt wide" placeholder="值" />
        <button class="sb-btn sb-btn-song" :disabled="!自定义表单.键.trim()" @click="写自定义">
          写入
        </button>
      </div>
    </div>

    <!-- 状态栏收敛为本页签内的折叠区块 -->
    <details class="sb-sec fold">
      <summary class="sb-sec-title" style="cursor: pointer; margin-bottom: 0">状态栏明细</summary>
      <table class="sb-tb" style="margin-top: 6px">
        <tbody>
          <tr>
            <th style="width: 34%">世界</th>
            <td>{{ 世界.日期 }} {{ 世界.时段 }} · {{ 世界.当前区域 }} · {{ 世界.当前场景 }} · {{ 世界.天气 }}</td>
          </tr>
          <tr>
            <th>剧情</th>
            <td>
              {{ 剧情.当前卷 }} · 章节 {{ 剧情.章节序号 }} · {{ 剧情.章节节点 }} · 主线 {{ 剧情.主线进度 }}%
            </td>
          </tr>
          <tr>
            <th>已触发事件</th>
            <td>
              <span v-if="!事件列表.length" class="sb-dim">无</span>
              <span v-for="e in 事件列表" :key="e.名称" class="sb-tag" :title="事件详情(e)">{{ e.名称 }}</span>
            </td>
          </tr>
          <tr>
            <th>分歧记录</th>
            <td>
              <span v-if="!分歧列表.length" class="sb-dim">无</span>
              <span v-for="d in 分歧列表" :key="d.名称" class="sb-tag sb-tag-bond" :title="分歧详情(d)">
                {{ d.名称 }}
              </span>
            </td>
          </tr>
          <tr>
            <th>战斗</th>
            <td>{{ 战斗.进行中 ? `进行中 · 第 ${战斗.回合} 回合 · ${战斗.阶段}` : '未开始' }}</td>
          </tr>
        </tbody>
      </table>
    </details>

    <!-- 快捷入口 -->
    <div class="sb-sec">
      <div class="sb-sec-title">快捷操作</div>
      <div class="ctl">
        <button class="sb-btn" @click="$emit('go', '战斗')"><i class="fa-solid fa-khanda" /> 战斗面板</button>
        <button class="sb-btn" @click="$emit('go', '领地')"><i class="fa-solid fa-landmark" /> 领地经营</button>
        <button class="sb-btn" @click="$emit('go', '技能树')"><i class="fa-solid fa-diagram-project" /> 技能树</button>
        <button class="sb-btn" @click="$emit('go', '图鉴')"><i class="fa-solid fa-book" /> 角色图鉴</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../../store';
import { 列, 计数 } from '../../工具';

defineEmits<{ go: [tab: string] }>();

const store = useDataStore();
const { 世界, 剧情, 主角, 战斗, 系统 } = store.data;

const 诅咒开 = computed(() => 主角.诅咒?.血之祭奠 === true);

// 枚举与开关键都取自 schema，不引入 schema 外的取值
const 难度表 = ['轻松', '标准', '硬核'] as const;
const 状态类型 = ['增益', '减益', '特殊'] as const;
const 开关键 = ['孕事系统', '战斗自动结算', '领地自动产出', '作者插话'] as const;
type 开关键名 = (typeof 开关键)[number];

const 状态表单 = ref({ 名: '', 类型: '特殊' as string, 来源: '', 剩余时限: '' });
const 自定义表单 = ref({ 键: '', 值: '' });

function 设难度(d: string) {
  if (系统.难度 === d) return;
  系统.难度 = d as (typeof 难度表)[number];
}

/** 规则开关是枚举键的 record：按原始键翻转，不整体替换对象 */
function 翻转开关(k: 开关键名) {
  系统.规则开关[k] = 系统.规则开关[k] === false;
}

function 新增状态() {
  const f = 状态表单.value;
  const 名 = f.名.trim();
  if (!名 || 主角.状态[名]) return;
  主角.状态[名] = {
    类型: (状态类型 as readonly string[]).includes(f.类型) ? (f.类型 as (typeof 状态类型)[number]) : '特殊',
    来源: f.来源.trim(),
    剩余时限: f.剩余时限.trim(),
  };
  状态表单.value = { 名: '', 类型: '特殊', 来源: '', 剩余时限: '' };
}

function 删状态(键名: string) {
  delete 主角.状态[键名];
}

const 自定义列表 = computed(() => Object.entries(系统.玩家自定义 ?? {}).map(([键, 值]) => ({ 键, 值 })));

/** 玩家自定义是任意字符串键的 record：同名键直接覆盖，符合「改设置」的直觉 */
function 写自定义() {
  const f = 自定义表单.value;
  const 键 = f.键.trim();
  if (!键) return;
  系统.玩家自定义[键] = f.值;
  自定义表单.value = { 键: '', 值: '' };
}

function 删自定义(键名: string) {
  delete 系统.玩家自定义[键名];
}

// 以下集合都是按名索引的 record：名称在 key 上，值是各字段
const 状态列表 = computed(() => 列(主角.状态));
const 事务列表 = computed(() => 列(世界.近期事务));
const 事件列表 = computed(() => 列(剧情.已触发事件));
const 分歧列表 = computed(() => 列(剧情.分歧记录));

// 阵营声望是按势力名索引的数值表，取绝对值最高的三项展示
const 声望摘要 = computed(() => {
  const entries = Object.entries(主角.阵营声望 || {}) as [string, number][];
  if (!entries.length) return '—';
  return entries
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3)
    .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`)
    .join(' · ');
});

function 状态说明(s: { 类型?: string; 来源?: string; 剩余时限?: string }) {
  return [s.类型, s.来源, s.剩余时限].filter(Boolean).join(' · ');
}

function 事件详情(e: { 卷?: string; 章节?: string; 结果?: string }) {
  return [e.卷, e.章节, e.结果].filter(Boolean).join(' · ');
}

function 分歧详情(d: { 卷?: string; 与原作差异?: string; 后果?: string }) {
  return [d.卷, d.与原作差异, d.后果].filter(Boolean).join(' · ');
}

const exps = computed(() => [
  {
    name: '主线史诗',
    icon: 'fa-scroll',
    value: Number(剧情.主线进度 ?? 0),
    cls: 'sb-bar-song',
    note: `${剧情.当前卷} · ${剧情.章节节点}`,
  },
  {
    name: '关系养成',
    icon: 'fa-heart',
    value: bondPct.value,
    cls: 'sb-bar-bond',
    note: `已结识 ${Object.values(store.data.关系).filter(r => (r.好感度 ?? 0) > 0).length} 人`,
  },
  {
    name: '领地经营',
    icon: 'fa-landmark',
    value: Math.min(100, Number(领地等级.value) * 10),
    cls: 'sb-bar-terra',
    note: `${store.data.领地.名称} · Lv.${领地等级.value} · 人口 ${store.data.领地.人口}`,
  },
  {
    name: '自由冒险',
    icon: 'fa-compass',
    value: Math.min(100, 计数(剧情.已触发事件) * 6),
    cls: 'sb-bar-song',
    note: `已触发原作事件 ${计数(剧情.已触发事件)} 项`,
  },
]);

const 领地等级 = computed(() => store.data.领地.等级 ?? 1);

const bondPct = computed(() => {
  const rs = Object.values(store.data.关系);
  if (!rs.length) return 0;
  const sum = rs.reduce((a, r) => a + Math.min(100, Number(r.好感度 ?? 0)), 0);
  return Math.round(sum / rs.length);
});
</script>

<style lang="scss" scoped>
.exp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 8px;
}

.exp-head {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  margin-bottom: 3px;
}

.exp-head span:nth-child(2) {
  flex: 1;
}

.exp-note {
  font-size: 11px;
  margin-top: 2px;
}

.attrs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 5px;
}

.attr {
  display: flex;
  align-items: center;
  gap: 6px;
}

.attr .k {
  flex: none;
  width: 32px;
  font-size: 12px;
  color: var(--sb-dim);
}

.attr .v {
  flex: none;
  width: 26px;
  text-align: right;
  font-size: 12px;
}

.hint {
  margin-top: 7px;
  font-size: 11px;
  border-top: 1px dashed var(--sb-line);
  padding-top: 5px;
}

.kv {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 3px;
  font-size: 12px;
}

.kv .sb-dim {
  margin-right: 6px;
}

.st-row,
.matter {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
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
  color: var(--sb-dim);
}

.fold[open] summary::before {
  content: '\25BE';
}

.ctl {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

/* 系统设置区：开关与表单只用全局配色，仅补布局 */
.rules {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.ctl .sb-btn.on {
  border-color: var(--sb-song);
  color: var(--sb-song);
}

.form {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 5px;
}

.ipt {
  background: #0d0b08;
  border: 1px solid var(--sb-line);
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 12px;
  padding: 2px 5px;
  min-width: 0;
  flex: 1 1 84px;
}

.ipt.wide {
  flex: 1 1 150px;
}

.ipt:focus {
  outline: none;
  border-color: var(--sb-song);
}

.x {
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
</style>
