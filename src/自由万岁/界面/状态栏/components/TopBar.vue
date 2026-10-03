<template>
  <div class="topbar">
    <div class="topbar-name">自由万岁</div>
    <div class="topbar-meta">
      <span>{{ store.data.世界.当前日期 }}</span>
      <span class="dot">·</span>
      <span>{{ store.data.世界.当前场景 }}</span>
    </div>
    <div class="topbar-stage">第{{ stageLabel }} · {{ store.data.世界.剧情阶段.replace('阶段', '') }}阶段{{ stageName }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../../store';

const store = useDataStore();

const STAGE_NAMES: Record<string, string> = {
  阶段一: '订婚宴决裂',
  阶段二: '落差初现',
  阶段三: '职场挣扎',
  阶段四: '全面崩溃',
  阶段五: '触底与转折',
  阶段六: '结局',
};
const CN_NUM: Record<string, string> = { 阶段一: '一', 阶段二: '二', 阶段三: '三', 阶段四: '四', 阶段五: '五', 阶段六: '六' };

const stageLabel = computed(() => CN_NUM[store.data.世界.剧情阶段] ?? '');
const stageName = computed(() => {
  const name = STAGE_NAMES[store.data.世界.剧情阶段];
  return name ? `「${name}」` : '';
});
</script>

<style scoped>
.topbar {
  background: linear-gradient(135deg, var(--c-primary), #5e1f27);
  color: #f7f3ea;
  padding: 12px 16px 10px;
}
.topbar-name {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 6px;
}
.topbar-meta {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.85;
}
.dot { margin: 0 4px; opacity: 0.6; }
.topbar-stage {
  margin-top: 6px;
  display: inline-block;
  border: 1px solid rgba(201, 161, 90, 0.7);
  color: var(--c-gold);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 12px;
  letter-spacing: 1px;
}
</style>
