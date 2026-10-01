<template>
  <div>
    <div class="sb-sec">
      <div class="sb-sec-title">
        角色图鉴 · 共 {{ rows.length }} 人
        <span class="sb-dim">选中后可直接改好感 / 信任 / 亲密、切关系阶段、改印象</span>
      </div>
      <div v-if="!rows.length" class="sb-empty">尚无关系记录。</div>
      <div v-else class="cards">
        <div
          v-for="r in rows"
          :key="r.name"
          class="c"
          :class="{ sel: r.name === 选中 }"
          @click="选中 = r.name"
        >
          <div class="chead">
            <b>{{ r.name }}</b>
            <span class="sb-tag sb-tag-bond">{{ r.关系阶段 }}</span>
            <span v-if="r.name === 选中" class="sb-tag sb-tag-song">已选中</span>
          </div>

          <div class="line">
            <span class="lbl">好感</span>
            <div class="sb-bar sb-bar-bond"><i :style="{ width: 条宽('好感度', r.好感度) }" /></div>
            <span class="sb-num v">{{ r.好感度 }}</span>
          </div>

          <div class="line">
            <span class="lbl">信任</span>
            <div class="sb-bar sb-bar-bond"><i :style="{ width: 条宽('信任度', r.信任度) }" /></div>
            <span class="sb-num v">{{ r.信任度 }}</span>
          </div>

          <div class="line">
            <span class="lbl">亲密</span>
            <div class="sb-bar sb-bar-bond"><i :style="{ width: 条宽('亲密', r.亲密) }" /></div>
            <span class="sb-num v">{{ r.亲密 }}</span>
          </div>

          <div class="imp sb-dim">{{ r.印象 }}</div>

          <div v-if="r.已触发互动.length" class="iv">
            <span v-for="(e, i) in r.已触发互动" :key="i" class="sb-tag">{{ e }}</span>
          </div>

          <div v-if="r.孕事 && r.孕事.状态 && r.孕事.状态 !== '无'" class="preg">
            <i class="fa-solid fa-baby" /> {{ r.孕事.状态 }} · {{ r.孕事.孕期 }} · 胎数 {{ r.孕事.胎数 }} ·
            预产期 {{ r.孕事.预产期 }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="当前" class="sb-sec">
      <div class="sb-sec-title">
        关系微调 · {{ 当前.name }}
        <span class="sb-tag sb-tag-bond">{{ 当前.关系阶段 }}</span>
        <span class="sb-dim">每次 ±5，改动都会写入已触发互动</span>
      </div>

      <div v-for="k in 数值键" :key="k" class="line">
        <span class="lbl">{{ k }}</span>
        <button class="sb-btn mini sb-btn-bond" :disabled="!可减(k)" @click="微调(k, -5)">−5</button>
        <div class="sb-bar sb-bar-bond"><i :style="{ width: 条宽(k, 当前[k]) }" /></div>
        <span class="sb-num v">{{ 当前[k] }}</span>
        <button class="sb-btn mini sb-btn-bond" :disabled="!可增(k)" @click="微调(k, 5)">＋5</button>
        <span class="sb-dim rng">{{ 范围[k][0] }} ~ {{ 范围[k][1] }}</span>
      </div>

      <div class="stage-row">
        <span class="lbl">阶段</span>
        <button
          v-for="s in 阶段序"
          :key="s"
          class="sb-btn mini sb-btn-bond"
          :class="{ act: s === 当前.关系阶段 }"
          @click="切阶段(s)"
        >
          {{ s }}
        </button>
      </div>

      <div class="imp-row">
        <input
          v-model="印象草稿"
          class="sb-in"
          :placeholder="当前.印象 || '印象'"
          @keyup.enter="存印象"
        />
        <button class="sb-btn sb-btn-song" @click="存印象">
          <i class="fa-solid fa-pen" /> 保存印象
        </button>
      </div>

      <div class="sb-dim hint">
        关系阶段进入疏离后亲密判定锁死，直到触发挽回事件；跨档推进要有对应的共同经历。
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">后宫与子嗣概况</div>
      <div class="kv">
        <div><span class="sb-dim">后宫成员</span><span class="sb-num">{{ 计数(后宫.成员) }}</span></div>
        <div><span class="sb-dim">子嗣</span><span class="sb-num">{{ 计数(后宫.子嗣) }}</span></div>
        <div><span class="sb-dim">亲密记录</span><span class="sb-num">{{ 计数(后宫.亲密记录) }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDataStore } from '../../store';
import { 计数 } from '../../工具';

const store = useDataStore();
const { 后宫 } = store.data;

// 关系阶段只能是 schema 枚举里这六档
const 阶段序 = ['初识', '同伴', '相知', '相爱', '妻子', '疏离'] as const;
type 阶段 = (typeof 阶段序)[number];

const 范围 = { 好感度: [-100, 100], 信任度: [-100, 100], 亲密: [0, 100] } as const;
const 数值键 = ['好感度', '信任度', '亲密'] as const;
type 数值键 = (typeof 数值键)[number];

const 选中 = ref('');
const 印象草稿 = ref('');

// 切人时同步印象草稿，避免把上一个人的文本存到下一个人头上
watch(选中, name => {
  印象草稿.value = store.data.关系[name]?.印象 ?? '';
});

/** 好感度与信任度是双向值，条宽按 −100~100 映射到 0~100 */
function 条宽(键: 数值键, 值: unknown) {
  const n = Number(值 ?? 0);
  return `${键 === '亲密' ? Math.max(0, Math.min(100, n)) : Math.max(0, Math.min(100, (n + 100) / 2))}%`;
}

const rows = computed(() =>
  Object.entries(store.data.关系).map(([name, r]) => ({
    name,
    好感度: Number(r.好感度 ?? 0),
    信任度: Number(r.信任度 ?? 0),
    亲密: Number(r.亲密 ?? 0),
    关系阶段: r.关系阶段,
    印象: r.印象 ?? '',
    已触发互动: r.已触发互动 ?? [],
    孕事: r.孕事,
  })),
);

const 当前 = computed(() => rows.value.find(r => r.name === 选中.value) ?? null);

function 记互动(name: string, 文本: string) {
  const r = store.data.关系[name];
  if (!r) return;
  if (!Array.isArray(r.已触发互动)) (r as any).已触发互动 = [];
  r.已触发互动.push(文本);
}

function 可增(键: 数值键) {
  return Number(当前.value?.[键] ?? 0) < 范围[键][1];
}

function 可减(键: 数值键) {
  return Number(当前.value?.[键] ?? 0) > 范围[键][0];
}

function 微调(键: 数值键, 增量: number) {
  const r = store.data.关系[选中.value];
  if (!r) return;
  const 旧 = Number(r[键] ?? 0);
  const 新 = Math.max(范围[键][0], Math.min(范围[键][1], 旧 + 增量));
  if (新 === 旧) return;
  r[键] = 新;
  记互动(选中.value, `${键} ${增量 > 0 ? '+' : ''}${增量} → ${新}`);
}

function 切阶段(目标: 阶段) {
  const r = store.data.关系[选中.value];
  if (!r || r.关系阶段 === 目标) return;
  const 旧 = r.关系阶段;
  r.关系阶段 = 目标;
  记互动(选中.value, `关系阶段 ${旧} → ${目标}`);
}

function 存印象() {
  const r = store.data.关系[选中.value];
  if (!r) return;
  const 新 = 印象草稿.value.trim();
  if (!新 || 新 === r.印象) return;
  r.印象 = 新;
  记互动(选中.value, `印象更新：${新}`);
}
</script>

<style lang="scss" scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 7px;
}

.c {
  border: 1px solid var(--sb-line);
  border-left: 2px solid var(--sb-bond);
  background: var(--sb-bg);
  padding: 6px 7px;
  cursor: pointer;
}

.c.sel {
  border-color: var(--sb-bond);
  box-shadow: 0 0 6px rgba(201, 111, 138, 0.24) inset;
}

.chead {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.line {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
}

.lbl {
  flex: none;
  width: 28px;
  color: var(--sb-dim);
  font-size: 11px;
}

.v {
  flex: none;
  width: 30px;
  text-align: right;
  font-size: 11px;
}

.line .sb-bar {
  flex: 1;
}

.mini {
  padding: 1px 6px;
  font-size: 11px;
  line-height: 1.3;
}

.act {
  border-color: var(--sb-bond);
  color: var(--sb-bond);
}

.rng {
  flex: none;
  font-size: 10px;
}

.imp {
  font-size: 11px;
  margin-top: 4px;
  border-top: 1px dotted var(--sb-line);
  padding-top: 3px;
}

.iv {
  margin-top: 3px;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.preg {
  margin-top: 4px;
  font-size: 11px;
  color: var(--sb-bond);
  border-top: 1px dashed var(--sb-line);
  padding-top: 3px;
}

.stage-row,
.imp-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.sb-in {
  flex: 1;
  min-width: 140px;
  background: #0d0b08;
  border: 1px solid var(--sb-line);
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 12px;
  padding: 3px 6px;
}

.kv {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
}

.kv .sb-dim {
  margin-right: 5px;
}

.hint {
  margin-top: 7px;
  font-size: 11px;
  border-top: 1px dashed var(--sb-line);
  padding-top: 5px;
}
</style>
