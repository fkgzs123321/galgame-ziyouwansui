<template>
  <div>
    <div class="card">
      <div class="card-title">你的位置</div>
      <div class="row">
        <span class="cell"><em>身份</em>{{ d.玩家.身份 || '未定（可在对话中声明）' }}</span>
        <span class="cell"><em>资金</em>{{ d.玩家.资金 }} 元</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">主线锚点 · 十环</div>
      <p class="hint">当前阶段节拍 {{ d.世界.阶段节拍 }} / 门槛 {{ gate }} —— 门槛未到，锚点不会触发；用日常节拍把它填满。</p>
      <ol class="anchor-list">
        <li v-for="(a, i) in anchors" :key="a.name" :class="{ done: a.done, current: a.current }">
          <span class="idx">{{ i + 1 }}</span>
          <span class="a-name">{{ a.name }}</span>
          <span class="a-stage">{{ a.stage }}</span>
          <span class="mark">{{ a.done ? '已触发' : a.current ? '进行中' : '' }}</span>
        </li>
      </ol>
    </div>

    <div class="card">
      <div class="card-title">风声 · 你听说的幕后</div>
      <p v-if="!rumors.length" class="hint">暂无风声。世界在你看不见的地方继续运转。</p>
      <ul v-else class="rumors">
        <li v-for="(r, i) in rumors" :key="i">{{ r }}</li>
      </ul>
    </div>

    <div class="card">
      <div class="card-title">阶段推进</div>
      <ul class="rules">
        <li>阶段一完成「订婚宴泼酒」「资源收回」后，进入阶段二</li>
        <li>「转正名单」触发即进入阶段三</li>
        <li>「质问陆司砚」「客户流失」「林清禾拿下项目」完成后，进入阶段四</li>
        <li>「母亲病危」完成后进入阶段五</li>
        <li>阶段五按觉醒度结算分支后进入阶段六</li>
      </ul>
      <div class="row branch">
        <span class="cell"><em>反弹线</em>觉醒度 ≥ 70</span>
        <span class="cell"><em>败露线</em>周燃暴露度 ≥ 80</span>
        <span class="cell"><em>新生线</em>母亲脱离危险</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../../store';

const store = useDataStore();
const d = computed(() => store.data);

const STAGE_ORDER = ['阶段一', '阶段一', '阶段三', '阶段三', '阶段三', '阶段四', '阶段四', '阶段四', '阶段四', '阶段四'];
const NAMES = ['订婚宴泼酒', '资源收回', '转正名单', '质问陆司砚', '客户流失', '林清禾拿下项目', '道歉被拒', '陆家拒门', '母亲病危', '收入对比'];
const STAGE_TEXT = ['阶段一', '阶段一', '阶段三', '阶段三', '阶段三', '阶段三', '阶段四', '阶段四', '阶段四', '阶段四'];

const anchors = computed(() => {
  const done: string[] = d.value.世界.已触发锚点;
  let currentShown = false;
  return NAMES.map((name, i) => {
    const isDone = done.includes(name);
    const isCurrent = !isDone && !currentShown && STAGE_ORDER[i] === d.value.世界.剧情阶段;
    if (isCurrent) currentShown = true;
    return { name, done: isDone, current: isCurrent, stage: STAGE_TEXT[i] };
  });
});

const rumors = computed(() => [...(d.value.世界.幕后动态 ?? [])].reverse());

const GATES: Record<string, number> = { 阶段一: 4, 阶段二: 8, 阶段三: 14, 阶段四: 10, 阶段五: 10, 阶段六: 0 };
const gate = computed(() => GATES[d.value.世界.剧情阶段] || 0);
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
.hint { font-size: 12px; color: var(--c-muted); margin-bottom: 6px; }
.anchor-list { list-style: none; }
.anchor-list li {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 0; border-bottom: 1px dashed var(--c-border); font-size: 13px;
}
.anchor-list li:last-child { border-bottom: none; }
.idx {
  width: 20px; height: 20px; border-radius: 50%;
  border: 1px solid var(--c-border); color: var(--c-muted);
  display: inline-flex; align-items: center; justify-content: center; font-size: 11px;
}
.a-name { flex: 1; }
.a-stage { font-size: 11px; color: var(--c-muted); }
.mark { font-size: 11px; color: var(--c-gold); width: 44px; text-align: right; }
li.done .idx { background: var(--c-primary); border-color: var(--c-primary); color: #fff; }
li.done .a-name { color: var(--c-muted); text-decoration: line-through; }
li.done .mark { color: var(--c-primary); }
li.current .idx { border-color: var(--c-gold); color: var(--c-gold); }
li.current .a-name { font-weight: 700; color: var(--c-gold); }
.rules { list-style: none; font-size: 12px; color: var(--c-ink); }
.rules li { padding: 2px 0; }
.rules li::before { content: '·'; color: var(--c-gold); margin-right: 6px; font-weight: 700; }
.rumors { list-style: none; font-size: 12px; color: var(--c-ink); }
.rumors li { padding: 3px 0; border-bottom: 1px dashed var(--c-border); }
.rumors li:last-child { border-bottom: none; }
.rumors li::before { content: '☾'; color: var(--c-muted); margin-right: 6px; }
.row { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 5px; }
.cell { font-size: 12px; }
.cell em { font-style: normal; color: var(--c-muted); margin-right: 4px; }
.branch .cell { border: 1px dashed var(--c-border); border-radius: 6px; padding: 2px 8px; }
</style>
