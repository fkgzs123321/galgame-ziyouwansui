<template>
  <div>
    <div class="card last">
      <div class="card-title">最近判定</div>
      <template v-if="last && last.结果 !== '无需判定'">
        <div class="dice-face" :class="resultClass(last.结果)">
          <div class="dice-result">{{ last.结果 }}</div>
          <div class="dice-roll">
            <span class="roll-num">{{ last.骰值 }}</span>
            <span class="vs">vs 目标 {{ last.目标 }}</span>
          </div>
        </div>
        <div class="desc">{{ last.说明 }}</div>
      </template>
      <p v-else class="hint">还没有进行过判定。当你尝试有失败可能的关键行动时，命运会掷出 d100。</p>
    </div>

    <div class="card">
      <div class="card-title">判定记录</div>
      <p v-if="!history.length" class="hint">暂无记录</p>
      <ul class="history">
        <li v-for="(r, i) in history" :key="i">
          <span class="tag" :class="resultClass(r.结果)">{{ r.结果 }}</span>
          <span class="text">{{ r.说明 }}</span>
          <span class="num">{{ r.骰值 }}/{{ r.目标 }}</span>
        </li>
      </ul>
    </div>

    <div class="card">
      <div class="card-title">判定规则</div>
      <ul class="rules">
        <li>关键行动先判定后叙述：质问、摊牌、说服、侦查、争取机会、对抗性博弈</li>
        <li>目标值 = 50 + 情境修正：对方好感 ≥60 时 ±10、觉醒度 ≥40 时 +10、周燃暴露度 ≥40 时 +10、明显不合理的行为 −20</li>
        <li>骰值 ≥ 90 大成功：全额收益并追加意外之喜</li>
        <li>骰值 ≥ 目标 成功：按规则正常结算</li>
        <li>骰值 &lt; 目标 失败：收益减半或无效，关系可能受损</li>
        <li>骰值 ≤ 10 大失败：全额无效并追加负面后果</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../../store';

const store = useDataStore();
const d = computed(() => store.data);
const last = computed(() => d.value.世界.最近判定);
const history = computed(() => [...(d.value.世界.判定记录 ?? [])].reverse());
const resultClass = (r: string) => ({ 大成功: 'r-great', 成功: 'r-good', 失败: 'r-bad', 大失败: 'r-awful' })[r] ?? '';
</script>

<style scoped>
.card {
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface);
  padding: 8px 10px;
  margin-bottom: 8px;
}
.card-title { font-weight: 700; margin-bottom: 6px; color: var(--c-primary); letter-spacing: 1px; }
.hint { font-size: 12px; color: var(--c-muted); }
.dice-face {
  border-radius: 8px; padding: 14px; text-align: center;
  border: 1px solid var(--c-border); background: var(--c-surface-deep);
}
.dice-result { font-size: 20px; font-weight: 800; letter-spacing: 4px; }
.dice-roll { margin-top: 6px; }
.roll-num { font-size: 28px; font-weight: 800; }
.vs { margin-left: 8px; font-size: 12px; color: var(--c-muted); }
.desc { margin-top: 8px; font-size: 12px; color: var(--c-muted); text-align: center; }
.r-great { color: var(--c-gold); }
.r-good { color: var(--c-success); }
.r-bad { color: var(--c-warn); }
.r-awful { color: var(--c-danger); }
.history { list-style: none; }
.history li {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 0; border-bottom: 1px dashed var(--c-border); font-size: 12px;
}
.history li:last-child { border-bottom: none; }
.tag { font-weight: 700; width: 44px; }
.text { flex: 1; color: var(--c-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.num { color: var(--c-muted); }
.rules { list-style: none; font-size: 12px; }
.rules li { padding: 3px 0; border-bottom: 1px dashed var(--c-border); }
.rules li:last-child { border-bottom: none; }
.rules li::before { content: '骰'; color: var(--c-gold); margin-right: 6px; font-weight: 700; }
</style>
