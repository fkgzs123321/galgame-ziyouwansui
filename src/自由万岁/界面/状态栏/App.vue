<template>
  <div class="sb-root">
    <TopBar />
    <TabNav v-model="active_tab" :tabs="tabs" />
    <div class="sb-pad">
      <RoleCards v-if="active_tab === '人物'" />
      <PlotPanel v-else-if="active_tab === '剧情'" />
      <DicePanel v-else-if="active_tab === '判定'" />
      <OverviewPanel v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TopBar from './components/TopBar.vue';
import TabNav from './components/TabNav.vue';
import OverviewPanel from './components/OverviewPanel.vue';
import RoleCards from './components/RoleCards.vue';
import PlotPanel from './components/PlotPanel.vue';
import DicePanel from './components/DicePanel.vue';

const active_tab = ref('总览');
const tabs = ['总览', '人物', '剧情', '判定'];
</script>
