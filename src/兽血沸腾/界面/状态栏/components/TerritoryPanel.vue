<template>
  <div>
    <div class="sb-sec">
      <div class="sb-sec-title">
        {{ 领地.名称 }} · Lv.{{ 领地.等级 }}
        <span class="sb-tag sb-tag-terra">声望 {{ 领地.声望 }}</span>
      </div>
      <div class="bars">
        <div class="b">
          <span class="lbl">人口</span>
          <div class="sb-bar sb-bar-terra">
            <i :style="{ width: cap(领地.人口, 10000) }" /><span class="sb-num">{{ 领地.人口 }}</span>
          </div>
        </div>
        <div class="b">
          <span class="lbl">民心</span>
          <div class="sb-bar sb-bar-terra">
            <i :style="{ width: `${领地.民心}%` }" /><span class="sb-num">{{ 领地.民心 }}</span>
          </div>
        </div>
        <div class="b">
          <span class="lbl">治安</span>
          <div class="sb-bar sb-bar-terra">
            <i :style="{ width: `${领地.治安}%` }" /><span class="sb-num">{{ 领地.治安 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">资源产出入</div>
      <table class="sb-tb">
        <thead>
          <tr><th>资源</th><th style="width: 18%">存量</th><th style="width: 46%">主要去处</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in 资源列表" :key="r.name">
            <td>{{ r.name }}</td>
            <td class="sb-num">{{ r.值 }}</td>
            <td class="sb-dim">{{ r.用途 }}</td>
          </tr>
        </tbody>
      </table>
      <div class="ctl" style="margin-top: 6px">
        <button class="sb-btn sb-btn-terra" :disabled="领地.民心 < 2" @click="征收">
          <i class="fa-solid fa-coins" /> 征收（金币 +80 · 民心 −2）
        </button>
        <button class="sb-btn sb-btn-terra" :disabled="领地.资源.金币 < 20" @click="开垦">
          <i class="fa-solid fa-wheat-awn" /> 开垦（粮食 +60 · 金币 −20）
        </button>
      </div>
      <div class="sb-dim hint">
        征收是向领民加派，民心太低就不要动；开垦要买农具与种子，所以吃金币。木材与石料只能由叙事结算
        获得，采伐、采石都要先有人手与商路。
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">建筑升级队列</div>
      <table class="sb-tb">
        <thead>
          <tr>
            <th>建筑</th>
            <th style="width: 10%">等级</th>
            <th style="width: 22%">状态</th>
            <th style="width: 40%">升级</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in 建筑列表" :key="b.名称">
            <td>
              {{ b.名称 }}
              <div class="sb-dim" style="font-size: 11px">{{ 建筑说明(b.名称) }}</div>
            </td>
            <td class="sb-num">Lv.{{ b.等级 }}</td>
            <td class="sb-dim">{{ b.状态 || '未动工' }}</td>
            <td>
              <div class="ctl">
                <button
                  class="sb-btn sb-btn-terra"
                  :disabled="!花得起(建筑消耗(b.名称))"
                  @click="升级建筑(b.名称)"
                >
                  升级 → Lv.{{ b.等级 + 1 }}
                </button>
              </div>
              <div class="sb-dim cost">造价 {{ 消耗文本(建筑消耗(b.名称)) }}</div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="sb-dim hint">
        造价随当前等级递增；资源不够时按钮不可点，先在叙事或上面两个按钮里补资源。
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">
        兵力 · 招募与训练
        <span class="sb-dim">每次招募</span>
        <input v-model.number="招募数量" class="ipt num" type="number" min="1" max="9999" />
        <span class="sb-dim">人</span>
      </div>
      <table class="sb-tb">
        <thead>
          <tr>
            <th>兵种</th>
            <th style="width: 10%">数量</th>
            <th style="width: 12%">训练度</th>
            <th style="width: 44%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in 兵力列表" :key="u.名称">
            <td>
              {{ u.名称 }}
              <div class="sb-dim" style="font-size: 11px">{{ u.说明 }}</div>
            </td>
            <td class="sb-num">{{ u.数量 }}</td>
            <td class="sb-num">{{ u.训练度 }}/100</td>
            <td>
              <div class="ctl">
                <button
                  class="sb-btn sb-btn-terra"
                  :disabled="!可招募(u.名称)"
                  :title="招募说明(u.名称)"
                  @click="招募(u.名称)"
                >
                  招募 {{ 招募数 }}
                </button>
                <button class="sb-btn" :disabled="!可训练(u.名称)" @click="训练(u.名称)">
                  训练 +5
                </button>
              </div>
              <div class="sb-dim cost">
                募兵 {{ 消耗文本(招募消耗(u.名称)) }} · 整训 {{ 消耗文本(训练消耗(u.名称)) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="sb-dim hint">
        募兵要金币与粮食，整训只要金币；训练度到 100 就练无可练，精锐靠战报里的实战累积。
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">附庸族</div>
      <div v-if="!附庸族列表.length" class="sb-empty">尚未招揽附庸族。归附须先完成对应归附事件。</div>
      <div v-else class="fud">
        <div v-for="f in 附庸族列表" :key="f.名称" class="fud-row">
          <span class="sb-tag sb-tag-terra">{{ f.名称 }}</span>
          <span class="sb-dim">
            {{ f.人数 || 0 }} 人<template v-if="f.代表"> · 代表 {{ f.代表 }}</template>
          </span>
          <button
            class="sb-btn sb-btn-terra"
            :title="`关系将变为「${下一个关系(f.关系)}」`"
            @click="转关系(f.名称)"
          >
            关系：{{ f.关系 || '稳定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../../store';
import { 列, 键 } from '../../工具';

const store = useDataStore();
const { 领地, 世界 } = store.data;

function cap(cur: number, max: number) {
  if (!max) return '0%';
  return `${Math.max(0, Math.min(100, (Number(cur) / max) * 100)).toFixed(1)}%`;
}

/** 留痕：面板操作写进 世界.近期事务，概览面板会显示，AI 因此知道玩家做了什么 */
function 留痕(说明: string) {
  let i = 1;
  while (世界.近期事务[`领地-${i}`]) i += 1;
  世界.近期事务[`领地-${i}`] = { 类型: '领地', 说明, 状态: '进行中' };
}

const 资源用途: Record<string, string> = {
  金币: '招募、采购与外交的通用硬通货',
  粮食: '军粮与领民口粮',
  木材: '建房、制图腾柱与造车',
  石料: '城墙、要塞与祭坛基座',
  铁: '军械与甲胄，王国矿山全属国有',
  精金: '高端魔法装备与传送阵核心',
  魔晶: '魔法阵与魔法装备的动力来源',
};

const 资源列表 = computed(() =>
  Object.entries(领地.资源 ?? {}).map(([name, v]) => ({
    name,
    值: v,
    用途: 资源用途[name] ?? '—',
  })),
);

// 资源表在 schema 里是枚举键的 record，扣减时按动态键名处理，这里统一收口成普通索引
function 资源库() {
  return 领地.资源 as Record<string, number>;
}

function 花得起(消耗: Record<string, number>) {
  const 库 = 资源库();
  return Object.entries(消耗).every(([k, v]) => (库[k] ?? 0) >= v);
}

function 扣资源(消耗: Record<string, number>) {
  const 库 = 资源库();
  for (const [k, v] of Object.entries(消耗)) 库[k] = (库[k] ?? 0) - v;
}

function 消耗文本(消耗: Record<string, number>) {
  return Object.entries(消耗)
    .map(([k, v]) => `${k} ${v}`)
    .join(' · ');
}

function 加成(键名: string, 量: number) {
  const 库 = 资源库();
  库[键名] = Math.min(999999, (库[键名] ?? 0) + 量);
}

function 征收() {
  if (领地.民心 < 2) return;
  加成('金币', 80);
  领地.民心 = Math.max(0, 领地.民心 - 2);
  留痕('领地加派征收，金币 +80，民心 −2。');
}

function 开垦() {
  if ((领地.资源.金币 ?? 0) < 20) return;
  领地.资源.金币 = 领地.资源.金币 - 20;
  加成('粮食', 60);
  留痕('领地开垦新田，粮食 +60，金币 −20。');
}

// 建筑造价取自世界观的资源消耗条目：木制项吃木材、基座与城墙吃石料、军械吃铁
const 建筑说明表: Record<string, string> = {
  城墙: '领地防线的根本，石料的主要去处',
  要塞: '屯兵与据守的支点',
  集市广场: '贸易与税源，木制图腾柱与瞭望塔是最大单项消耗',
  瞭望塔: '预警与斥候驻地',
  伐木场: '桑干河沿岸与竹林的木材集散',
  采石场: '本无石山，须从地底与北方山脉运石',
  农田: '领民口粮与军粮的来源',
  兵营: '募兵与整训的场所',
  铁匠铺: '武器作坊，铁矿全靠海路与地底补给',
  民居: '招徕领民、扩充人口的前提',
};

const 建筑基价: Record<string, Record<string, number>> = {
  城墙: { 金币: 90, 石料: 120, 木材: 40 },
  要塞: { 金币: 160, 石料: 180, 铁: 60 },
  集市广场: { 金币: 100, 木材: 90, 石料: 40 },
  瞭望塔: { 金币: 70, 木材: 80, 石料: 50 },
  伐木场: { 金币: 60, 木材: 60 },
  采石场: { 金币: 60, 木材: 40, 石料: 30 },
  农田: { 金币: 50, 木材: 30, 石料: 20 },
  兵营: { 金币: 120, 木材: 60, 石料: 60, 铁: 30 },
  铁匠铺: { 金币: 110, 石料: 70, 铁: 50 },
  民居: { 金币: 40, 木材: 70, 石料: 20 },
};

const 建筑列表 = computed(() => {
  const 已知 = Object.keys(建筑说明表);
  const 名 = [...已知, ...键(领地.建筑).filter(k => !已知.includes(k))];
  return 名.map(name => ({
    名称: name,
    等级: 领地.建筑[name]?.等级 ?? 0,
    状态: 领地.建筑[name]?.状态 ?? '',
  }));
});

function 建筑说明(name: string) {
  return 建筑说明表[name] ?? '叙事中新增的建筑';
}

function 建筑消耗(name: string) {
  const 基 = 建筑基价[name] ?? { 金币: 80, 木材: 40, 石料: 30 };
  // 0 级视作待建，按 1 级计价，避免第一级白送
  const 倍 = Math.max(1, 领地.建筑[name]?.等级 ?? 0);
  return Object.fromEntries(Object.entries(基).map(([k, v]) => [k, v * 倍]));
}

function 升级建筑(name: string) {
  const 消耗 = 建筑消耗(name);
  if (!花得起(消耗)) return;
  扣资源(消耗);
  const 表 = 领地.建筑;
  if (!表[name]) 表[name] = { 等级: 0, 状态: '已建成' };
  const v = 表[name];
  v.等级 = Math.min(99, (v.等级 ?? 0) + 1);
  if (!v.状态) v.状态 = '已建成';
  留痕(`建筑「${name}」升级至 Lv.${v.等级}，消耗 ${消耗文本(消耗)}。`);
}

// 键必须是真实兵种，实际数量在领地.兵力 上累加
const 兵种说明: Record<string, string> = {
  比蒙战士: '基础步兵，可升为精锐与狂暴战士',
  猛犸骑兵: '重装冲击骑兵，人口稀缺',
  俄勒芬巨象勇士: '力量顶点，皮肤坚硬',
  熊猫武士: '潘塔族，可升为东方护卫',
  麝人弹弓手: '远程投掷',
  匹格族豪猪掷矛手: '远程',
  狼骑兵: '沃尔夫族米格军团主力',
  狈族萨满随军: '沙罗曼祭祀，随军加持狼骑兵',
  天鹅族骑士: '斯迈族转地面骑士，独有禁空之歌',
  螳螂刀圣: '绿党族，不能狂化',
};

const 兵种单价: Record<string, { 金币: number; 粮食: number }> = {
  比蒙战士: { 金币: 5, 粮食: 3 },
  猛犸骑兵: { 金币: 20, 粮食: 8 },
  俄勒芬巨象勇士: { 金币: 16, 粮食: 7 },
  熊猫武士: { 金币: 12, 粮食: 5 },
  麝人弹弓手: { 金币: 6, 粮食: 3 },
  匹格族豪猪掷矛手: { 金币: 5, 粮食: 3 },
  狼骑兵: { 金币: 14, 粮食: 6 },
  狈族萨满随军: { 金币: 18, 粮食: 5 },
  天鹅族骑士: { 金币: 22, 粮食: 8 },
  螳螂刀圣: { 金币: 25, 粮食: 6 },
};

const 招募数量 = ref(10);

/** 一次招募不许超过库里能养得起的规模，同时给个上限避免手滑输入天文数字 */
const 招募数 = computed(() => {
  const n = Math.floor(Number(招募数量.value));
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(9999, n));
});

const 兵力列表 = computed(() => {
  const 已知 = Object.keys(兵种说明);
  const 名 = [...已知, ...键(领地.兵力).filter(k => !已知.includes(k))];
  return 名.map(name => ({
    名称: name,
    说明: 兵种说明[name] ?? '叙事中新增的兵种',
    数量: 领地.兵力[name]?.数量 ?? 0,
    训练度: 领地.兵力[name]?.训练度 ?? 0,
  }));
});

function 招募消耗(name: string) {
  const 单 = 兵种单价[name] ?? { 金币: 8, 粮食: 4 };
  return { 金币: 单.金币 * 招募数.value, 粮食: 单.粮食 * 招募数.value };
}

function 训练消耗(name: string) {
  const 数量 = 领地.兵力[name]?.数量 ?? 0;
  // 队伍越大整训越贵，但小队伍也有最低开销
  return { 金币: Math.max(10, Math.ceil(数量 / 10) * 5) };
}

function 可招募(name: string) {
  return 花得起(招募消耗(name));
}

function 可训练(name: string) {
  return (领地.兵力[name]?.数量 ?? 0) > 0 && (领地.兵力[name]?.训练度 ?? 0) < 100 && 花得起(训练消耗(name));
}

function 招募说明(name: string) {
  const 库 = 资源库();
  const 缺 = Object.entries(招募消耗(name))
    .filter(([k, v]) => (库[k] ?? 0) < v)
    .map(([k]) => k);
  return 缺.length ? `缺 ${缺.join('、')}` : `招募 ${招募数.value} 名${name}`;
}

function 招募(name: string) {
  const 消耗 = 招募消耗(name);
  if (!花得起(消耗)) return;
  扣资源(消耗);
  const 表 = 领地.兵力;
  if (!表[name]) 表[name] = { 数量: 0, 训练度: 0 };
  const v = 表[name];
  v.数量 = Math.min(999999, (v.数量 ?? 0) + 招募数.value);
  留痕(`领地招募 ${name} ${招募数.value} 名，共 ${v.数量} 名，消耗 ${消耗文本(消耗)}。`);
}

function 训练(name: string) {
  const v = 领地.兵力[name];
  if (!v || (v.数量 ?? 0) <= 0 || (v.训练度 ?? 0) >= 100) return;
  const 消耗 = 训练消耗(name);
  if (!花得起(消耗)) return;
  扣资源(消耗);
  v.训练度 = Math.min(100, (v.训练度 ?? 0) + 5);
  留痕(`${name} 整训一次，训练度升至 ${v.训练度}，消耗 ${消耗文本(消耗)}。`);
}

const 附庸族列表 = computed(() => 列(领地.附庸族));

const REL = ['融洽', '稳定', '紧张', '对立'] as const;

function 下一个关系(关系: string) {
  const i = REL.indexOf(关系 as (typeof REL)[number]);
  return REL[i < 0 ? 1 : (i + 1) % REL.length];
}

function 转关系(名: string) {
  const v = 领地.附庸族[名];
  if (!v) return;
  const 下一个 = 下一个关系(v.关系);
  v.关系 = 下一个 as (typeof REL)[number];
  留痕(`附庸族「${名}」关系转为 ${下一个}。`);
}
</script>

<style lang="scss" scoped>
.bars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 6px;
}

.b {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lbl {
  flex: none;
  width: 30px;
  color: var(--sb-dim);
  font-size: 12px;
}

.hint {
  margin-top: 7px;
  font-size: 11px;
  border-top: 1px dashed var(--sb-line);
  padding-top: 5px;
}

.sb-tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ctl {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.cost {
  font-size: 10px;
  margin-top: 2px;
}

/* 招募人数沿用战报面板的深色输入风格，作用域留在本组件 */
.ipt.num {
  background: #0d0b08;
  border: 1px solid var(--sb-line);
  color: var(--sb-text);
  font-family: var(--sb-mono);
  font-size: 12px;
  padding: 2px 5px;
  width: 56px;
}

.ipt.num:focus {
  outline: none;
  border-color: var(--sb-song);
}

.fud {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fud-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
</style>
