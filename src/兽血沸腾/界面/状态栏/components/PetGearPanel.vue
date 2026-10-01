<template>
  <div>
    <div class="sb-sec">
      <div class="sb-sec-title">
        魔宠舱
        <span class="sb-dim">每个灵魂歌者终生只能有一只魔宠</span>
      </div>
      <div v-if="!pets.length" class="sb-empty">尚无魔宠记录。</div>
      <div v-else class="cards">
        <div v-for="p in pets" :key="p.key" class="c">
          <div class="chead">
            <b>{{ p.key }}</b>
            <span class="sb-tag sb-tag-song">{{ p.种类 }}</span>
            <span
              class="sb-tag"
              :class="p.已签 ? 'sb-tag-song' : 'sb-tag-life'"
            >
              {{ p.已签 ? '已签灵魂契约' : '未签灵魂契约' }}
            </span>
          </div>
          <div class="line">
            <span class="lbl">忠诚</span>
            <button class="sb-btn" :disabled="!p.忠诚" @click="调忠诚(p.key, -5)">−5</button>
            <div class="sb-bar sb-bar-song"><i :style="{ width: `${clamp(p.忠诚)}%` }" /></div>
            <span class="sb-num v">{{ p.忠诚 }}</span>
            <button class="sb-btn" :disabled="p.忠诚 >= 100" @click="调忠诚(p.key, 5)">+5</button>
          </div>
          <div class="kv">
            <div><span class="sb-dim">阶位</span>{{ p.阶位 || '—' }}</div>
            <div><span class="sb-dim">状态</span>{{ p.状态 || '—' }}</div>
          </div>
          <div class="line">
            <span class="lbl">技能</span>
            <input
              class="ipt"
              :value="p.技能原文"
              placeholder="顿号分隔"
              @change="写技能(p.key, $event)"
            />
          </div>
          <div v-if="p.技能.length" class="sk">
            <span v-for="s in p.技能" :key="s" class="sb-tag">{{ s }}</span>
          </div>
          <div class="line" style="margin-top: 4px">
            <button class="sb-btn sb-btn-song" :disabled="p.已签" @click="签契约(p.key)">
              <i class="fa-solid fa-handshake" /> 签订灵魂契约
            </button>
            <button class="sb-btn sb-btn-life" :disabled="!p.已签" @click="解契约(p.key)">
              解除契约
            </button>
          </div>
          <div v-if="!p.已签" class="warn">
            未签契约的魔宠不参与血之祭奠的诅咒嫁接。
          </div>
        </div>
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">装备栏</div>
      <table v-if="装备.length" class="sb-tb">
        <thead><tr><th style="width: 20%">部位</th><th>装备</th><th style="width: 14%">品阶</th><th style="width: 16%">状态</th><th style="width: 14%"></th></tr></thead>
        <tbody>
          <tr v-for="g in 装备" :key="g.部位">
            <td>{{ g.部位 }}</td>
            <td>{{ g.名称 }}</td>
            <td class="sb-dim">{{ g.品阶 || '—' }}</td>
            <td class="sb-dim">{{ g.状态 || '—' }}</td>
            <td>
              <button class="sb-btn" :disabled="!g.可穿" @click="切换装备(g.部位)">
                {{ g.穿上 ? '卸下' : '穿戴' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="sb-empty">未着装备。</div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">物品栏 · {{ 物品.length }} 项</div>
      <table v-if="物品.length" class="sb-tb">
        <thead><tr><th style="width: 34%">物品</th><th style="width: 20%">数量</th><th>备注</th></tr></thead>
        <tbody>
          <tr v-for="it in 物品" :key="it.name">
            <td>{{ it.name }}</td>
            <td class="sb-num">{{ it.数量 }}</td>
            <td class="sb-dim">{{ it.备注 }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="sb-empty">物品栏为空。</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../../store';
import { 标签 } from '../../工具';

const store = useDataStore();
const { 主角, 魔宠 } = store.data;

function clamp(v: unknown) {
  return Math.max(0, Math.min(100, Number(v ?? 0)));
}

type 魔宠项 = { 种类?: string; 忠诚?: number; 阶位?: string; 技能?: string; 状态?: string; 契约?: string };

const pets = computed(() =>
  Object.keys(魔宠 ?? {}).map(name => {
    // 魔宠是 record，键名即宠名；写回必须用原始键，不能用 列() 展开后的下标
    const p = (魔宠[name] ?? {}) as 魔宠项;
    return {
      key: name,
      种类: p.种类 ?? '未知',
      忠诚: clamp(p.忠诚),
      阶位: p.阶位 ?? '',
      状态: p.状态 ?? '',
      // 技能在 schema 里是顿号分隔的字符串，展示前用 标签() 摊平成数组
      技能: 标签(p.技能),
      技能原文: p.技能 ?? '',
      // 契约是文本字段（变量更新规则里只有「已签/未签」两值）
      已签: String(p.契约 ?? '') === '已签',
    };
  }),
);

/** 忠诚钳制在 0~100，避免写回时被 zod 截断而与界面显示不一致 */
function 调忠诚(键名: string, delta: number) {
  const p = 魔宠[键名];
  if (!p) return;
  p.忠诚 = Math.max(0, Math.min(100, Math.round(Number(p.忠诚 ?? 0) + delta)));
}

function 签契约(键名: string) {
  const p = 魔宠[键名];
  if (!p) return;
  p.契约 = '已签';
}

function 解契约(键名: string) {
  const p = 魔宠[键名];
  if (!p) return;
  p.契约 = '未签';
}

/** 技能是纯文本字段，内联编辑失焦后写回 */
function 写技能(键名: string, e: Event) {
  const p = 魔宠[键名];
  if (!p) return;
  p.技能 = (e.target as HTMLInputElement).value;
}

const 装备 = computed(() =>
  Object.entries(主角.装备 ?? {}).map(([部位, v]) => {
    const g = (v ?? {}) as { 名称?: string; 品阶?: string; 状态?: string };
    const 名称 = g.名称 ?? '';
    return {
      部位,
      名称: 名称 || '—',
      品阶: g.品阶 ?? '',
      状态: g.状态 ?? '',
      // 空置部位没有可穿的装备
      可穿: !!名称 && 名称 !== '空置',
      穿上: !!名称 && 名称 !== '空置' && g.状态 !== '未穿戴',
    };
  }),
);

/** 穿脱只改 状态 文本，空置部位禁止操作 */
function 切换装备(部位: string) {
  const g = 主角.装备[部位];
  if (!g || !g.名称 || g.名称 === '空置') return;
  g.状态 = g.状态 === '未穿戴' ? '已穿戴' : '未穿戴';
}

const 物品 = computed(() =>
  Object.entries(主角.物品栏 ?? {}).map(([name, v]) => ({
    name,
    数量: typeof v === 'number' ? v : ((v as any)?.数量 ?? 1),
    备注: typeof v === 'number' ? '' : ((v as any)?.说明 ?? (v as any)?.备注 ?? ''),
  })),
);
</script>

<style lang="scss" scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 7px;
}

.c {
  border: 1px solid var(--sb-line);
  border-left: 2px solid var(--sb-song);
  background: var(--sb-bg);
  padding: 6px 7px;
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
  margin-bottom: 4px;
}

.lbl {
  flex: none;
  width: 28px;
  color: var(--sb-dim);
  font-size: 11px;
}

.v {
  flex: none;
  width: 26px;
  text-align: right;
  font-size: 11px;
}

.kv {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.kv .sb-dim {
  margin-right: 5px;
}

.sk {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.warn {
  margin-top: 4px;
  font-size: 11px;
  color: var(--sb-life);
  border-top: 1px dashed var(--sb-line);
  padding-top: 3px;
}

/* 忠诚 ±5 与技能内联编辑：只补布局，配色沿用全局 */
.line .sb-btn {
  flex: none;
  padding: 0 5px;
  font-size: 11px;
}

.ipt {
  background: #0d0b08;
  border: 1px solid var(--sb-line);
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 12px;
  padding: 2px 5px;
  min-width: 0;
  flex: 1;
}

.ipt:focus {
  outline: none;
  border-color: var(--sb-song);
}
</style>
