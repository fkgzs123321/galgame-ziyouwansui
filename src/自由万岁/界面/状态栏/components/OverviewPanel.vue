<template>
  <div>
    <div class="card card-main">
      <div class="card-title">沈知意</div>
      <div class="bar"><span class="bar-label">对好感</span><span class="bar-track"><span class="bar-fill" :style="{ width: pct(d.沈知意.对玩家好感) }"></span></span><span class="bar-num">{{ d.沈知意.对玩家好感 }}</span></div>
      <div class="bar"><span class="bar-label">觉醒度</span><span class="bar-track"><span class="bar-fill" :style="{ width: pct(d.沈知意.觉醒度) }"></span></span><span class="bar-num">{{ d.沈知意.觉醒度 }}</span></div>
      <div class="row">
        <span class="cell"><em>职场</em>{{ d.沈知意.转正状态 }}</span>
        <span class="cell"><em>陆家</em>{{ d.沈知意.陆家态度 }}</span>
        <span class="cell"><em>母亲</em>{{ d.沈知意.母亲病情 }}</span>
        <span class="cell"><em>节拍</em>{{ d.世界.阶段节拍 }}{{ beatGate ? ' / ' + beatGate : '' }}</span>
      </div>
      <div class="row">
        <span class="cell"><em>对周燃</em>{{ d.沈知意.对周燃态度 }}</span>
        <span class="cell"><em>对陆司砚</em>{{ d.沈知意.对陆司砚态度 }}</span>
        <span class="cell danger"><em>债务</em>{{ d.沈知意.债务金额 }} 元</span>
      </div>
      <div class="res-line">
        <span v-for="(taken, name) in d.沈知意.七项资源" :key="name" class="res" :class="{ taken }">{{ name }}</span>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="card-title">周燃</div>
        <div class="bar"><span class="bar-label">暴露度</span><span class="bar-track"><span class="bar-fill warn-fill" :style="{ width: pct(d.周燃.暴露度) }"></span></span><span class="bar-num">{{ d.周燃.暴露度 }}</span></div>
        <div class="row"><span class="cell"><em>修车店</em>{{ d.周燃.修车店经营 }}</span></div>
      </div>
      <div class="card">
        <div class="card-title">你自己</div>
        <div class="row"><span class="cell"><em>身份</em>{{ d.玩家.身份 || '未定' }}</span></div>
        <div class="row"><span class="cell"><em>资金</em>{{ d.玩家.资金 }} 元</span></div>
      </div>
    </div>

    <div v-if="last" class="card dice-brief">
      <span class="dice-tag" :class="resultClass(last.结果)">{{ last.结果 }}</span>
      <span class="dice-text">{{ last.说明 }}</span>
      <span class="dice-num">{{ last.骰值 }} / {{ last.目标 }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../../store';

const store = useDataStore();
const d = computed(() => store.data);

const pct = (n: number) => `${Math.max(0, Math.min(100, n))}%`;
const last = computed(() => d.value.世界.最近判定);
const resultClass = (r: string) => ({ 大成功: 'r-great', 成功: 'r-good', 失败: 'r-bad', 大失败: 'r-awful' })[r] ?? '';

const GATES: Record<string, number> = { 阶段一: 4, 阶段二: 8, 阶段三: 14, 阶段四: 10, 阶段五: 10, 阶段六: 0 };
const beatGate = computed(() => GATES[d.value.世界.剧情阶段] || 0);
</script>

<style scoped>
.card {
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
  padding: 8px 10px;
  margin-bottom: 8px;
}
.card-main { border-left: 3px solid var(--c-primary); }
.card-title { font-weight: 700; margin-bottom: 6px; color: var(--c-primary); letter-spacing: 1px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.bar { display: flex; align-items: center; gap: 6px; margin: 4px 0; }
.bar-label { width: 52px; color: var(--c-muted); font-size: 12px; }
.bar-num { width: 28px; text-align: right; font-size: 12px; color: var(--c-muted); }
.warn-fill { background: linear-gradient(90deg, #c07f2d, #a4322a); }
.row { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 5px; }
.cell { font-size: 12px; }
.cell em { font-style: normal; color: var(--c-muted); margin-right: 4px; }
.danger { color: var(--c-danger); font-weight: 600; }
.res-line { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 7px; }
.res {
  font-size: 11px; padding: 1px 7px; border-radius: 999px;
  border: 1px solid var(--c-border); color: var(--c-muted);
}
.res.taken {
  border-color: var(--c-primary); color: var(--c-primary);
  background: rgba(140, 47, 57, 0.07); text-decoration: line-through;
}
.dice-brief { display: flex; align-items: center; gap: 8px; }
.dice-tag { font-weight: 700; font-size: 13px; }
.dice-text { flex: 1; font-size: 12px; color: var(--c-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dice-num { font-weight: 700; }
.r-great { color: var(--c-gold); }
.r-good { color: var(--c-success); }
.r-bad { color: var(--c-warn); }
.r-awful { color: var(--c-danger); }
</style>
