<template>
  <div class="sb-root" :class="{ 'sb-war': is_war, 'sb-hurt': is_hurt }">
    <TopBar />

    <TabNav v-model="active_tab" :tabs="tabs" :badges="badges" />

    <div class="sb-pad">
      <OverviewPanel v-if="active_tab === '总览'" @go="t => (active_tab = t)" />
      <BattlePanel v-else-if="active_tab === '战斗'" />
      <SkillTreePanel v-else-if="active_tab === '技能树'" />
      <TerritoryPanel v-else-if="active_tab === '领地'" />
      <CharacterPanel v-else-if="active_tab === '图鉴'" />
      <ChroniclePanel v-else-if="active_tab === '编年史'" />
      <PetGearPanel v-else-if="active_tab === '魔宠装备'" />
      <HaremPanel v-else-if="active_tab === '后宫孕事'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import BattlePanel from './components/BattlePanel.vue';
import CharacterPanel from './components/CharacterPanel.vue';
import ChroniclePanel from './components/ChroniclePanel.vue';
import HaremPanel from './components/HaremPanel.vue';
import OverviewPanel from './components/OverviewPanel.vue';
import PetGearPanel from './components/PetGearPanel.vue';
import SkillTreePanel from './components/SkillTreePanel.vue';
import TabNav from './components/TabNav.vue';
import TerritoryPanel from './components/TerritoryPanel.vue';
import TopBar from './components/TopBar.vue';
import { useDataStore } from '../store';
import { 列 } from '../工具';

const store = useDataStore();

// 战时态：战斗进行中 → 整层压暗
const is_war = computed(() => store.data.战斗.进行中 === true);

// 重伤恢复过渡态：生命低于三成
const is_hurt = computed(() => {
  const { 当前, 上限 } = store.data.主角.生命;
  return !is_war.value && 上限 > 0 && 当前 / 上限 < 0.3;
});

// 孕事系统开关关闭时该页签隐藏
const preg_on = computed(() => store.data.系统.规则开关.孕事系统 !== false);

const tabs = computed(() => {
  const list = [
    { id: '总览', label: '总览' },
    { id: '战斗', label: '战斗' },
    { id: '技能树', label: '技能树' },
    { id: '领地', label: '领地' },
    { id: '图鉴', label: '图鉴' },
    { id: '编年史', label: '编年史' },
    { id: '魔宠装备', label: '魔宠装备' },
  ];
  if (preg_on.value) list.push({ id: '后宫孕事', label: '后宫孕事' });
  return list;
});

// 情境可见：仅在有对应内容时给页签加提示点
const badges = computed(() => {
  const map: Record<string, boolean> = {};
  if (store.data.战斗.进行中) map['战斗'] = true;
  // 孕事表按人名登记，元素带状态字段，默认 进行中，结案后写 已结束
  const preg = 列(store.data.后宫.孕事);
  if (preg.some(p => p.状态 && p.状态 !== '已结束')) map['后宫孕事'] = true;
  return map;
});

const active_tab = ref('总览');

// 战斗一开打就自动切到战斗面板并前台高亮
watch(
  () => store.data.战斗.进行中,
  now => {
    if (now) active_tab.value = '战斗';
  },
);
</script>
