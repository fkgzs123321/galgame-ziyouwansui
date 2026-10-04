<template>
  <header class="sb-top">
    <div class="row1">
      <span class="sb-emblem" :title="`祭祀阶位：${主角.阶位}`">{{ 阶位字 }}</span>

      <div class="who">
        <div class="name">
          {{ 扮演名 }} · {{ 主角.身份 || '无名者' }}
          <span v-if="诅咒开" class="sb-curse" title="血之祭奠：战歌不再有神奇效果">血之祭奠</span>
        </div>
        <div class="sub sb-dim">
          {{ 世界.当前区域 }} · {{ 世界.当前场景 }} · {{ 世界.日期 }} {{ 世界.时段 }}
        </div>
      </div>

      <div class="clock sb-dim">
        <div>{{ 剧情.当前卷 }}</div>
        <div class="sb-num">章节 {{ 剧情.章节序号 }} · 主线 {{ 剧情.主线进度 }}%</div>
      </div>
    </div>

    <div class="row2">
      <div class="res">
        <span class="lbl">生命</span>
        <div class="sb-bar sb-bar-life">
          <i :style="{ width: pct(主角.生命.当前, 主角.生命.上限) }" />
          <span class="sb-num">{{ 主角.生命.当前 }} / {{ 主角.生命.上限 }}</span>
        </div>
      </div>

      <div class="res">
        <span class="lbl">歌力</span>
        <div class="sb-bar sb-bar-song">
          <i :style="{ width: pct(主角.歌力.当前, 主角.歌力.上限) }" />
          <span class="sb-num">{{ 主角.歌力.当前 }} / {{ 主角.歌力.上限 }}</span>
        </div>
      </div>

      <div class="res narrow">
        <span class="lbl">体力</span>
        <div class="sb-bar sb-bar-terra">
          <i :style="{ width: `${主角.体力}%` }" />
          <span class="sb-num">{{ 主角.体力 }}</span>
        </div>
      </div>
    </div>

    <div class="row3">
      <span class="sb-tag">{{ 世界.天气 }}</span>
      <span v-for="s in 状态列表" :key="s.名称" class="sb-tag sb-tag-song" :title="状态说明(s)">
        {{ s.名称 }}
      </span>
      <span v-if="战斗.进行中" class="sb-tag sb-tag-life">战斗进行中 · 回合 {{ 战斗.回合 }}</span>
      <span v-if="孕事提示" class="sb-tag sb-tag-bond">孕事进行中</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../../store';
import { 列 } from '../../工具';

const store = useDataStore();
const { 世界, 剧情, 主角, 战斗 } = store.data;

// 玩家名：优先取所选角色的名称, 未定则回落到酒馆 persona 名
const 扮演名 = computed(() => 主角.名称 || window.SillyTavern?.getContext?.().name1 || '玩家');

// 阶位取尾字做石刻徽记：风语祭祀 → 风
const 阶位字 = computed(() => {
  const j = 主角.阶位;
  if (!j || j === '无') return '无';
  const m = j.match(/[\u4e00-\u9fa5]/g);
  return m?.[0] ?? '无';
});

const 诅咒开 = computed(() => 主角.诅咒?.血之祭奠 === true);

// 主角.状态 是按名索引的 record，名称在 key 上，值是 {类型, 来源, 剩余时限}
const 状态列表 = computed(() => 列(主角.状态));

function 状态说明(s: { 类型?: string; 来源?: string; 剩余时限?: string }) {
  return [s.类型, s.来源, s.剩余时限].filter(Boolean).join(' · ');
}

const 孕事提示 = computed(() => {
  if (store.data.系统.规则开关.孕事系统 === false) return false;
  // 孕事表按人名登记，元素带状态字段，默认 进行中，结案后写 已结束
  return 列(store.data.后宫.孕事).some(p => p.状态 && p.状态 !== '已结束');
});

function pct(cur: number, max: number) {
  if (!max) return '0%';
  return `${Math.max(0, Math.min(100, (cur / max) * 100)).toFixed(1)}%`;
}
</script>

<style lang="scss" scoped>
.sb-top {
  background: linear-gradient(180deg, #221c14, var(--sb-panel));
  border-bottom: 1px solid var(--sb-line);
  padding: 8px 10px;
}

.row1 {
  display: flex;
  align-items: center;
  gap: 8px;
}

.who {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sub {
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clock {
  text-align: right;
  font-size: 11px;
  flex: none;
}

.row2 {
  display: flex;
  gap: 8px;
  margin-top: 7px;
}

.res {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.res.narrow {
  flex: 0 0 92px;
}

.lbl {
  color: var(--sb-dim);
  font-size: 11px;
  flex: none;
}

.row3 {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
</style>
