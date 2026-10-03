<template>
  <div>
    <div v-for="p in people" :key="p.name" class="card">
      <div class="head">
        <span class="name">{{ p.name }}</span>
        <span class="tags">
          <span v-for="t in p.tags" :key="t" class="tag">{{ t }}</span>
        </span>
      </div>
      <div v-for="b in p.bars" :key="b.label" class="bar">
        <span class="bar-label">{{ b.label }}</span>
        <span class="bar-track"><span class="bar-fill" :class="b.cls" :style="{ width: pct(b.value) }"></span></span>
        <span class="bar-num">{{ b.value }}</span>
      </div>
      <div v-if="p.cells.length" class="row">
        <span v-for="c in p.cells" :key="c.label" class="cell"><em>{{ c.label }}</em>{{ c.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../../store';

const store = useDataStore();
const d = computed(() => store.data);
const pct = (n: number) => `${Math.max(0, Math.min(100, n))}%`;

const people = computed(() => [
  {
    name: '沈知意',
    tags: [d.value.沈知意.转正状态, `陆家·${d.value.沈知意.陆家态度}`],
    bars: [
      { label: '对好感', value: d.value.沈知意.对玩家好感, cls: '' },
      { label: '觉醒度', value: d.value.沈知意.觉醒度, cls: '' },
    ],
    cells: [
      { label: '母亲', value: d.value.沈知意.母亲病情 },
      { label: '对周燃', value: d.value.沈知意.对周燃态度 },
      { label: '对陆司砚', value: d.value.沈知意.对陆司砚态度 },
      { label: '债务', value: `${d.value.沈知意.债务金额} 元` },
    ],
  },
  {
    name: '陆司砚',
    tags: [`对她·${d.value.陆司砚.对沈知意态度}`],
    bars: [{ label: '对好感', value: d.value.陆司砚.对玩家好感, cls: '' }],
    cells: [],
  },
  {
    name: '林清禾',
    tags: [d.value.林清禾.职业阶段, `对沈知意·${d.value.林清禾.对沈知意态度}`],
    bars: [{ label: '对好感', value: d.value.林清禾.对玩家好感, cls: '' }],
    cells: [{ label: '月收入', value: `${d.value.林清禾.月收入} 元` }, { label: '与陆司砚', value: d.value.林清禾.与陆司砚感情 }],
  },
  {
    name: '周燃',
    tags: [`修车店·${d.value.周燃.修车店经营}`],
    bars: [{ label: '对好感', value: d.value.周燃.对玩家好感, cls: '' }, { label: '暴露度', value: d.value.周燃.暴露度, cls: 'warn-fill' }],
    cells: [],
  },
  {
    name: '赵媛',
    tags: [d.value.赵媛.站队立场],
    bars: [{ label: '对好感', value: d.value.赵媛.对玩家好感, cls: '' }],
    cells: [],
  },
  {
    name: '温惠茹',
    tags: [`婚姻·${d.value.温惠茹.婚姻心境}`],
    bars: [{ label: '对好感', value: d.value.温惠茹.对玩家好感, cls: '' }],
    cells: [],
  },
  {
    name: '苏晚晴',
    tags: [`病情·${d.value.沈知意.母亲病情}`],
    bars: [{ label: '对好感', value: d.value.苏晚晴.对玩家好感, cls: '' }],
    cells: [],
  },
]);
</script>

<style scoped>
.card {
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
  padding: 8px 10px;
  margin-bottom: 8px;
}
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.name { font-weight: 700; color: var(--c-primary); letter-spacing: 1px; }
.tags { display: flex; gap: 4px; flex-wrap: wrap; }
.tag {
  font-size: 11px; padding: 1px 7px; border-radius: 999px;
  border: 1px solid var(--c-border); color: var(--c-muted);
}
.bar { display: flex; align-items: center; gap: 6px; margin: 4px 0; }
.bar-label { width: 52px; color: var(--c-muted); font-size: 12px; }
.bar-num { width: 28px; text-align: right; font-size: 12px; color: var(--c-muted); }
.warn-fill { background: linear-gradient(90deg, #c07f2d, #a4322a); }
.row { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 5px; }
.cell { font-size: 12px; }
.cell em { font-style: normal; color: var(--c-muted); margin-right: 4px; }
</style>
