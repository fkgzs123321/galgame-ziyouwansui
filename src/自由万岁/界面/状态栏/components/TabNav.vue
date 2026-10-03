<template>
  <div class="tabnav">
    <button
      v-for="t in tabs"
      :key="t"
      class="tabnav-item"
      :class="{ active: modelValue === t }"
      @click="modelValue = t"
    >
      {{ t }}
    </button>
  </div>
</template>

<script setup lang="ts">
const modelValue = defineModel<string>({ required: true });
defineProps<{ tabs: readonly string[] }>();
</script>

<style scoped>
.tabnav {
  display: flex;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-surface);
}
.tabnav-item {
  flex: 1;
  padding: 8px 0;
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--c-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.tabnav-item.active {
  color: var(--c-primary);
  font-weight: 700;
  border-bottom-color: var(--c-primary);
  background: var(--c-surface-deep);
}
</style>
