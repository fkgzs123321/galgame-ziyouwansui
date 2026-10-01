<template>
  <div>
    <div class="sb-sec">
      <div class="sb-sec-title">剧情编年史 · 七卷时间轴</div>
      <div class="vols">
        <div
          v-for="(v, i) in VOLS"
          :key="v.name"
          class="vol"
          :class="{ done: i < curIdx, now: i === curIdx }"
        >
          <span class="dot" />
          <b>{{ v.name }}</b>
          <span class="sb-dim range">{{ v.range }}</span>
          <span v-if="i === curIdx" class="sb-tag sb-tag-song">进行中</span>
          <span v-else-if="i < curIdx" class="sb-tag">已过</span>
        </div>
      </div>
      <div class="sb-dim hint">
        当前：{{ 剧情.当前卷 }} · 章节 {{ 剧情.章节序号 }} · {{ 剧情.章节节点 }}
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">已触发原作事件 · {{ 事件列表.length }} 项</div>
      <div v-if="!事件列表.length" class="sb-empty">尚未触发原作事件。</div>
      <div v-else class="tag-wrap">
        <span v-for="e in 事件列表" :key="e.名称" class="sb-tag sb-tag-song" :title="事件详情(e)">
          {{ e.名称 }}
          <button class="x" title="撤回该事件" @click="删事件(e.名称)">×</button>
        </span>
      </div>
      <details class="fold" style="margin-top: 6px">
        <summary class="sb-dim" style="cursor: pointer; font-size: 11px">手动标记事件</summary>
        <div class="form">
          <input v-model="事件表单.名" class="ipt" placeholder="事件名" />
          <input v-model="事件表单.卷" class="ipt" placeholder="卷" />
          <input v-model="事件表单.章节" class="ipt" placeholder="章节" />
          <input v-model="事件表单.结果" class="ipt wide" placeholder="结果" />
          <button class="sb-btn sb-btn-song" :disabled="!事件表单.名.trim()" @click="标记事件">
            标记
          </button>
        </div>
      </details>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">名场面回顾</div>
      <div v-if="!landmarks.length" class="sb-empty">随剧情推进记录名场面。</div>
      <table v-else class="sb-tb">
        <thead><tr><th style="width: 22%">章节</th><th>场面</th><th style="width: 8%"></th></tr></thead>
        <tbody>
          <tr v-for="l in landmarks" :key="l.名称">
            <td class="sb-num">{{ l.章节 }}</td>
            <td>{{ l.内容 }}</td>
            <td><button class="x" title="移除" @click="删名场面(l.名称)">×</button></td>
          </tr>
        </tbody>
      </table>
      <details class="fold" style="margin-top: 6px">
        <summary class="sb-dim" style="cursor: pointer; font-size: 11px">归档名场面</summary>
        <div class="form">
          <input v-model="场面表单.名" class="ipt" placeholder="场面名" />
          <input v-model="场面表单.卷" class="ipt" placeholder="卷" />
          <input v-model="场面表单.章节" class="ipt" placeholder="章节" />
          <input v-model="场面表单.内容" class="ipt wide" placeholder="内容" />
          <button class="sb-btn sb-btn-song" :disabled="!场面表单.名.trim()" @click="归档名场面">
            归档
          </button>
        </div>
      </details>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">分歧记录 · {{ 分歧列表.length }} 条</div>
      <div v-if="!分歧列表.length" class="sb-empty">沿原作主线推进，尚无分歧。</div>
      <div v-else class="dist">
        <div v-for="(d, i) in 分歧列表" :key="d.名称" class="d">
          <span class="sb-tag sb-tag-bond">分歧 {{ i + 1 }}</span>
          <span :title="分歧详情(d)">{{ d.与原作差异 || d.后果 || d.名称 }}</span>
          <button class="x" title="删除该分歧" @click="删分歧(d.名称)">×</button>
        </div>
      </div>
      <details class="fold" style="margin-top: 6px">
        <summary class="sb-dim" style="cursor: pointer; font-size: 11px">写分歧记录</summary>
        <div class="form">
          <input v-model="分歧表单.名" class="ipt" placeholder="分歧名" />
          <input v-model="分歧表单.卷" class="ipt" placeholder="卷" />
          <input v-model="分歧表单.与原作差异" class="ipt wide" placeholder="与原作差异" />
          <input v-model="分歧表单.后果" class="ipt wide" placeholder="后果" />
          <button class="sb-btn sb-btn-song" :disabled="!分歧表单.名.trim()" @click="写分歧">
            记录
          </button>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../../store';
import { 列 } from '../../工具';

const store = useDataStore();
const { 剧情 } = store.data;

// 集合都是按名索引的 record：事件/分歧的名称在 key 上，值是各字段
const 事件列表 = computed(() => 列(剧情.已触发事件));
const 分歧列表 = computed(() => 列(剧情.分歧记录));

// 表单键名即 record 键：留空则不写入，避免覆盖已有条目
const 事件表单 = ref({ 名: '', 卷: '', 章节: '', 结果: '' });
const 场面表单 = ref({ 名: '', 卷: '', 章节: '', 内容: '' });
const 分歧表单 = ref({ 名: '', 卷: '', 与原作差异: '', 后果: '' });

/** 键名冲突时加序号，保证每次操作都留痕而非覆盖 */
function 唯一键(容器: Record<string, unknown>, 基: string) {
  if (!容器[基]) return 基;
  let i = 2;
  while (容器[`${基}(${i})`]) i += 1;
  return `${基}(${i})`;
}

function 标记事件() {
  const f = 事件表单.value;
  const 名 = f.名.trim();
  if (!名) return;
  // 未填的字段回落到当前剧情进度，避免写出空白的记录
  剧情.已触发事件[唯一键(剧情.已触发事件, 名)] = {
    卷: f.卷.trim() || 剧情.当前卷,
    章节: f.章节.trim() || 剧情.章节节点,
    结果: f.结果.trim(),
  };
  事件表单.value = { 名: '', 卷: '', 章节: '', 结果: '' };
}

function 删事件(键名: string) {
  delete 剧情.已触发事件[键名];
}

function 归档名场面() {
  const f = 场面表单.value;
  const 名 = f.名.trim();
  if (!名) return;
  剧情.名场面[唯一键(剧情.名场面, 名)] = {
    卷: f.卷.trim() || 剧情.当前卷,
    章节: f.章节.trim() || 剧情.章节节点,
    内容: f.内容.trim(),
  };
  场面表单.value = { 名: '', 卷: '', 章节: '', 内容: '' };
}

function 删名场面(键名: string) {
  delete 剧情.名场面[键名];
}

function 写分歧() {
  const f = 分歧表单.value;
  const 名 = f.名.trim();
  if (!名) return;
  // schema 里分歧记录只有 卷/与原作差异/后果 三个字段，不写 schema 外的键
  剧情.分歧记录[唯一键(剧情.分歧记录, 名)] = {
    卷: f.卷.trim() || 剧情.当前卷,
    与原作差异: f.与原作差异.trim(),
    后果: f.后果.trim(),
  };
  分歧表单.value = { 名: '', 卷: '', 与原作差异: '', 后果: '' };
}

function 删分歧(键名: string) {
  delete 剧情.分歧记录[键名];
}

function 事件详情(e: { 卷?: string; 章节?: string; 结果?: string }) {
  return [e.卷, e.章节, e.结果].filter(Boolean).join(' · ');
}

function 分歧详情(d: { 卷?: string; 与原作差异?: string; 后果?: string }) {
  return [d.卷, d.与原作差异, d.后果].filter(Boolean).join(' · ');
}

// 七卷原作结构（章节序号为 0-based）
const VOLS = [
  { name: '荒岛篇', range: '0–8' },
  { name: '胸罩岛篇', range: '9–20' },
  { name: '海上篇', range: '21–30' },
  { name: '多瑙大荒原篇', range: '31–42' },
  { name: '博格村与翡冷翠初期', range: '43–58' },
  { name: '翡冷翠领主期', range: '59–71' },
  { name: '比蒙王国纵横', range: '73–763' },
];

const curIdx = computed(() => {
  const i = VOLS.findIndex(v => v.name === 剧情.当前卷);
  if (i >= 0) return i;
  // 兜底：按章节序号落卷
  const c = Number(剧情.章节序号 ?? 0);
  if (c <= 8) return 0;
  if (c <= 20) return 1;
  if (c <= 30) return 2;
  if (c <= 42) return 3;
  if (c <= 58) return 4;
  if (c <= 71) return 5;
  return 6;
});

// 名场面按 剧情.名场面 的 record 取，键即场面名
const landmarks = computed(() =>
  列(剧情.名场面).map(l => ({
    名称: l.名称,
    章节: l.章节 || '—',
    内容: l.内容 || '—',
  })),
);
</script>

<style lang="scss" scoped>
.vols {
  display: grid;
  gap: 3px;
}

.vol {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--sb-dim);
  padding: 2px 0;
}

.vol .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1px solid var(--sb-line);
  flex: none;
}

.vol.done .dot {
  background: var(--sb-dim);
}

.vol.done {
  color: var(--sb-text);
}

.vol.now {
  color: var(--sb-song);
}

.vol.now .dot {
  background: var(--sb-song);
  border-color: var(--sb-song);
}

.range {
  margin-left: auto;
  font-family: var(--sb-mono);
  font-size: 11px;
}

.hint {
  margin-top: 7px;
  font-size: 11px;
  border-top: 1px dashed var(--sb-line);
  padding-top: 5px;
}

.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dist {
  display: grid;
  gap: 4px;
  font-size: 12px;
}

.d {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

/* 表单与行内删除按钮：沿用全局配色，仅补布局 */
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
  margin-left: 4px;
  background: none;
  border: none;
  color: var(--sb-dim);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 0 2px;
  vertical-align: middle;
}

.x:hover {
  color: var(--sb-life);
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
