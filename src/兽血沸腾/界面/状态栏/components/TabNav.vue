<template>
  <nav class="tabs">
    <button
      v-for="tab in props.tabs"
      :key="tab.id"
      class="tab-button"
      :class="{ active: model === tab.id }"
      @click="model = tab.id"
    >
      {{ tab.label }}
      <i v-if="props.badges[tab.id]" class="sb-dot" />
    </button>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  tabs: { id: string; label: string }[];
  badges?: Record<string, boolean>;
}>();

const model = defineModel<string>({ required: true });
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  background: var(--sb-panel2);
  border-bottom: 1px solid var(--sb-line);
}

.tab-button {
  flex: 1 0 auto;
  min-width: 64px;
  padding: 6px 4px;
  border: none;
  border-right: 1px solid var(--sb-line);
  background: transparent;
  color: var(--sb-dim);
  font-family: var(--sb-font);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.18s;
}

.tab-button:last-child {
  border-right: none;
}

.tab-button:hover {
  color: var(--sb-text);
  background: #2c251c;
}

.tab-button.active {
  color: var(--sb-song);
  background: var(--sb-bg);
  box-shadow: inset 0 -2px 0 var(--sb-song);
}
</style>
