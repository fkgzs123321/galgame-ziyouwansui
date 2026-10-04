<template>
  <div>
    <div class="sb-sec">
      <div class="sb-sec-title">
        技能树 · 四棵树与自定义节点
        <span class="sb-dim">面板改动直接写入本楼变量，AI 依变量写正文</span>
      </div>
      <div class="tree-pick">
        <button
          v-for="t in trees"
          :key="t.id"
          class="sb-btn"
          :class="{ on: cur === t.id }"
          @click="cur = t.id"
        >
          <i class="fa-solid" :class="t.icon" /> {{ t.label }}
          <span class="sb-num">{{ 树已解锁(t.id) }}</span>
        </button>
      </div>
    </div>

    <!-- 战歌树：解锁门槛由祭祀七阶决定，这里只开放已晋阶的部分，不提供跨阶解锁 -->
    <div v-if="cur === 'song'" class="sb-sec">
      <div class="sb-sec-title">
        战歌树 · 按圣坛祭祀七阶分段
        <span class="sb-tag sb-tag-song">熟练度：入门 → 熟练 → 精通 → 默发</span>
      </div>
      <div v-for="tier in song_tiers" :key="tier.name" class="tier-wrap">
        <div class="tier-head" :class="{ reached: tier.reached }">
          <i class="fa-solid" :class="tier.reached ? 'fa-lock-open' : 'fa-lock'" />
          <b>{{ tier.name }}</b>
          <span class="sb-dim">
            （当前阶位：{{ 主角.阶位 }} · 已解锁 {{ tier.解锁数 }}/{{ tier.nodes.length }}）
          </span>
        </div>
        <div class="sb-tier" :class="{ 'sb-tier-done': tier.reached }">
          <div v-if="!tier.nodes.length" class="sb-dim" style="font-size: 11px">
            原文未列该阶专属战歌，可到「自定义」页补记。
          </div>
          <div v-else class="nodes">
            <span v-for="n in tier.nodes" :key="n" class="node-cell">
              <button
                class="sb-node"
                :class="战歌类(tier.reached, n)"
                :disabled="!tier.reached && !战歌解锁(n)"
                :title="战歌解锁(n) ? '点击封存该战歌' : tier.reached ? '点击解锁该战歌' : '未晋阶到该阶，无法解锁'"
                @click="切换战歌(n)"
              >
                {{ n }}
                <span v-if="战歌解锁(n)" class="sb-dim lv">熟练 {{ 战歌熟练(n) }}</span>
              </button>
              <button
                v-if="战歌解锁(n)"
                class="sb-btn mini"
                title="每唱一次熟练度 +5，单次提升不超过 5"
                @click="练战歌(n)"
              >
                +5
              </button>
              <select
                v-if="战歌解锁(n)"
                class="ipt sel mini"
                :value="战歌层级(n)"
                title="层级：阕次或战歌类型"
                @change="改战歌层级(n, $event)"
              >
                <option v-for="l in 层级选项(n)" :key="l" :value="l">{{ l }}</option>
              </select>
            </span>
          </div>
        </div>
      </div>

      <!-- AI 在叙事里给出的战歌也要能操作，不让变量里出现看不见的节点 -->
      <div v-if="其他战歌.length" class="extra">
        <div class="sb-dim" style="font-size: 11px">叙事中获得的战歌</div>
        <div class="nodes">
          <span v-for="n in 其他战歌" :key="n" class="node-cell">
            <button
              class="sb-node"
              :class="战歌类(true, n)"
              title="点击切换解锁状态"
              @click="切换战歌(n)"
            >
              {{ n }}
              <span v-if="战歌解锁(n)" class="sb-dim lv">熟练 {{ 战歌熟练(n) }}</span>
            </button>
            <button v-if="战歌解锁(n)" class="sb-btn mini" @click="练战歌(n)">+5</button>
            <select
              v-if="战歌解锁(n)"
              class="ipt sel mini"
              :value="战歌层级(n)"
              title="层级：阕次或战歌类型"
              @change="改战歌层级(n, $event)"
            >
              <option v-for="l in 层级选项(n)" :key="l" :value="l">{{ l }}</option>
            </select>
          </span>
        </div>
      </div>

      <div class="hint sb-dim">
        种族专属节点：洗浑战歌（狈族沙罗曼祭祀）· 禁空之歌（斯迈族天鹅）· 苍穹先知（斯凯德族蝉人）
      </div>
    </div>

    <!-- 异体原 -->
    <div v-else-if="cur === 'body'" class="sb-sec">
      <div class="sb-sec-title">异体原 · 仅刘震撼路线的异体成长</div>
      <table class="sb-tb">
        <thead>
          <tr>
            <th>异体原</th>
            <th style="width: 30%">来源</th>
            <th style="width: 16%">主角当前</th>
            <th style="width: 32%">技能树</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in body_rows" :key="r.name">
            <td>{{ r.name }}</td>
            <td class="sb-dim">{{ r.from }}</td>
            <td class="sb-num">{{ r.当前 }}</td>
            <td>
              <div class="ctl">
                <button
                  class="sb-btn"
                  :class="成长解锁(r.name) ? 'sb-btn-song' : ''"
                  @click="切换成长(r.name)"
                >
                  {{ 成长解锁(r.name) ? '已解锁' : '解锁' }}
                </button>
                <button
                  class="sb-btn"
                  :disabled="!成长解锁(r.name)"
                  title="层级上限 99"
                  @click="升级成长(r.name)"
                >
                  层级 +1
                </button>
                <span class="sb-num sb-dim">第 {{ 成长层级(r.name) }} 层</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="hint sb-dim">
        异体原靠剧情来源获得，不用点数兑换；层级记录已突破的层数，未解锁为 0。
      </div>
    </div>

    <!-- 兵种与军事树 -->
    <div v-else-if="cur === 'army'" class="sb-sec">
      <div class="sb-sec-title">兵种与军事树 · 升级路径 新兵 → 老兵 → 精锐 → 王牌</div>
      <table class="sb-tb">
        <thead>
          <tr>
            <th>兵种</th>
            <th style="width: 30%">说明</th>
            <th style="width: 10%">兵力</th>
            <th style="width: 34%">技能树</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in army_all" :key="u.name">
            <td>{{ u.name }}</td>
            <td class="sb-dim">{{ u.desc }}</td>
            <td class="sb-num">{{ 兵力(u.name) || '—' }}</td>
            <td>
              <div class="ctl">
                <button
                  class="sb-btn"
                  :class="兵种解锁(u.name) ? 'sb-btn-song' : ''"
                  @click="切换兵种(u.name)"
                >
                  {{ 兵种解锁(u.name) ? '已解锁' : '解锁' }}
                </button>
                <button class="sb-btn" :disabled="!兵种解锁(u.name)" @click="升级兵种(u.name)">
                  等级 +1
                </button>
                <button class="sb-btn" :disabled="!兵种解锁(u.name)" @click="训练兵种(u.name)">
                  训练度 +5
                </button>
              </div>
              <div class="sb-dim cost">
                Lv.{{ 兵种等级(u.name) }} · 训练度 {{ 兵种训练度(u.name) }}/100
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="hint sb-dim">
        无祭祀加持时比蒙战士仍可自主狂化；兵种树只记等级与训练度，实际数量在领地面板招募。
      </div>
    </div>

    <!-- 领地科技树 -->
    <div v-else-if="cur === 'tech'" class="sb-sec">
      <div class="sb-sec-title">
        领地科技树 · 前置关系 祭祀学院 → 祭坛 → 战歌图腾柱 → 神曲光环
      </div>
      <div class="tech-chain">
        <template v-for="(t, i) in tech_nodes" :key="t.name">
          <span class="sb-node" :class="{ on: 科技状态(t.name) !== '未解锁' }">
            {{ t.name }}
            <span v-if="科技等级(t.name)" class="sb-dim lv">Lv.{{ 科技等级(t.name) }}</span>
          </span>
          <i v-if="i < tech_nodes.length - 1" class="fa-solid fa-arrow-right arrow" />
        </template>
      </div>
      <table class="sb-tb" style="margin-top: 8px">
        <thead>
          <tr>
            <th>节点</th>
            <th style="width: 30%">作用</th>
            <th style="width: 12%">状态</th>
            <th style="width: 34%">建设</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tech_all" :key="t.name">
            <td>{{ t.name }}</td>
            <td class="sb-dim">{{ t.desc }}</td>
            <td>
              <span class="sb-tag" :class="科技标签类(t.name)">{{ 科技状态(t.name) }}</span>
            </td>
            <td>
              <div class="ctl">
                <button
                  class="sb-btn sb-btn-terra"
                  :disabled="!科技可推进(t.name)"
                  :title="科技说明(t.name)"
                  @click="推进科技(t.name)"
                >
                  {{ 科技下一步(t.name) }}
                </button>
                <button
                  class="sb-btn"
                  :disabled="科技状态(t.name) !== '已解锁' || !花得起(科技消耗(t.name))"
                  title="扩建一级，造价随等级上涨"
                  @click="扩建科技(t.name)"
                >
                  等级 +1
                </button>
              </div>
              <div class="sb-dim cost">造价 {{ 消耗文本(科技消耗(t.name)) }}</div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="hint sb-dim">
        科技节点须先满足主链前置并备齐资源，资源不足时按钮不可点；资源在领地面板征收、采伐、采石与开垦中补给。
      </div>
    </div>

    <!-- 自定义节点 -->
    <div v-else class="sb-sec">
      <div class="sb-sec-title">自定义节点 · 玩家自建</div>
      <div class="form">
        <input v-model="自定义表单.名称" class="ipt" placeholder="名称，如 汉语自创战歌" />
        <input v-model="自定义表单.说明" class="ipt wide" placeholder="说明" />
        <input v-model="自定义表单.消耗" class="ipt" placeholder="消耗，如 歌力 20" />
        <select v-model="自定义表单.状态" class="ipt sel">
          <option v-for="s in 状态选项" :key="s" :value="s">{{ s }}</option>
        </select>
        <button class="sb-btn sb-btn-song" :disabled="!自定义表单.名称.trim()" @click="新增自定义">
          <i class="fa-solid fa-plus" /> 新增自定义节点
        </button>
      </div>
      <table v-if="自定义列表.length" class="sb-tb" style="margin-top: 6px">
        <thead>
          <tr>
            <th>节点</th>
            <th style="width: 18%">消耗</th>
            <th style="width: 14%">状态</th>
            <th style="width: 30%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in 自定义列表" :key="c.名称">
            <td>
              {{ c.名称 }}
              <div class="sb-dim" style="font-size: 11px">{{ c.说明 || '—' }}</div>
            </td>
            <td class="sb-dim">{{ c.消耗 || '—' }}</td>
            <td>
              <span class="sb-tag" :class="自定义标签类(c.状态)">{{ c.状态 || '未解锁' }}</span>
            </td>
            <td>
              <div class="ctl">
                <button
                  class="sb-btn"
                  title="未解锁 → 成长中 → 已解锁"
                  @click="推进自定义(c.名称)"
                >
                  {{ 下一个自定义状态(c.状态) }}
                </button>
                <button class="sb-btn" style="color: var(--sb-life)" @click="删自定义(c.名称)">
                  <i class="fa-solid fa-trash" /> 删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="sb-empty">尚未建立自定义节点。</div>
      <div class="hint sb-dim">
        自定义节点只记状态不给效果，实际作用由叙事呈现；名字重复时会自动加序号，不覆盖已有节点。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../../store';
import { 列, 键 } from '../../工具';

const store = useDataStore();
const { 主角, 技能树, 领地, 世界 } = store.data;

const trees = [
  { id: 'song', label: '战歌树', icon: 'fa-music' },
  { id: 'body', label: '异体原', icon: 'fa-dna' },
  { id: 'army', label: '兵种树', icon: 'fa-shield-halved' },
  { id: 'tech', label: '领地科技树', icon: 'fa-hammer' },
  { id: 'custom', label: '自定义', icon: 'fa-star' },
];
const cur = ref('song');

// 祭祀七阶原文顺序
const TIERS = [
  '风语祭祀',
  '灵魂祭祀',
  '战争祭祀',
  '权杖祭祀',
  '维安大萨满',
  '十二主祭',
  '红衣大祭司',
];

// 键必须是原文真实战歌名，规则类描述（如「全战歌无吟唱限制」）不列为节点
const TIER_NODES: Record<string, string[]> = {
  风语祭祀: ['通灵战歌上阕'],
  灵魂祭祀: ['通灵战歌', '智慧启蒙', '平静之光', '安魂曲', '魔宠召唤'],
  战争祭祀: [
    '祝福战歌',
    '石肤战歌',
    '辉煌战歌',
    '嗜血战歌',
    '吸血战歌',
    '狂暴战歌',
    '狂化战歌',
    '献祭战歌',
    '战舞',
  ],
  权杖祭祀: [
    '通灵战歌后半阕',
    '心灵锁链战歌',
    '灵魂锁链战歌',
    '力量汲取战歌',
    '致幻战歌',
    '单控战歌',
    '默发战歌',
  ],
  维安大萨满: ['淫亵战歌', '神曲', '神曲光环'],
  十二主祭: [],
  红衣大祭司: [],
};
const 全部战歌名 = new Set(Object.values(TIER_NODES).flat());

/**
 * 留痕：写进 世界.近期事务，概览面板会展示，AI 因此知道玩家在面板上做了什么。
 * 键按序号递增，避免同一节点反复操作互相覆盖。
 */
function 留痕(说明: string, 类型: '主线' | '支线' | '领地' | '私人' = '领地') {
  let i = 1;
  while (世界.近期事务[`技能-${i}`]) i += 1;
  世界.近期事务[`技能-${i}`] = { 类型, 说明, 状态: '进行中' };
}

const song_tiers = computed(() => {
  const idx = TIERS.indexOf(主角.阶位);
  return TIERS.map((name, i) => {
    const nodes = TIER_NODES[name] ?? [];
    // 阶位为「无」时只有第一阶可点开
    const reached = idx < 0 ? i === 0 : i <= idx;
    return { name, nodes, reached, 解锁数: nodes.filter(n => 战歌解锁(n)).length };
  });
});

function 战歌解锁(name: string) {
  return 技能树.战歌树[name]?.解锁 === true;
}

function 战歌熟练(name: string) {
  return 技能树.战歌树[name]?.熟练度 ?? 0;
}

function 战歌类(reached: boolean, name: string) {
  const on = 战歌解锁(name);
  return { on, locked: !reached && !on };
}

function 切换战歌(name: string) {
  const t = 技能树.战歌树;
  const v = t[name];
  if (!v) {
    t[name] = { 解锁: true, 熟练度: 0, 层级: '' };
    留痕(`解锁战歌「${name}」。`, '主线');
    return;
  }
  // 反复点击用于纠正误操作，熟练度原样保留，重新解锁即可恢复
  v.解锁 = v.解锁 !== true;
  留痕(`${v.解锁 ? '解锁' : '暂时封存'}战歌「${name}」。`, '主线');
}

function 练战歌(name: string) {
  const v = 技能树.战歌树[name];
  if (!v) return;
  v.熟练度 = Math.min(100, (v.熟练度 ?? 0) + 5);
  留痕(`练习战歌「${name}」，熟练度升至 ${v.熟练度}。`, '主线');
}

// 层级是文本字段（阕次或战歌类型），因此只能给候选值，不做数字增减
function 战歌层级(name: string) {
  return 技能树.战歌树[name]?.层级 || '第一阕';
}

function 层级选项(name: string) {
  const 候选 = ['第一阕', '第二阕', '第三阕', '交响', '单控', '独奏', '神曲'];
  const 当前 = 技能树.战歌树[name]?.层级;
  // AI 可能写过别的层级，保留它以免下拉框把已有值抹掉
  return 当前 && !候选.includes(当前) ? [当前, ...候选] : 候选;
}

function 改战歌层级(name: string, e: Event) {
  const v = 技能树.战歌树[name];
  if (!v) return;
  v.层级 = (e.target as HTMLSelectElement).value;
  留痕(`战歌「${name}」层级调为 ${v.层级}。`, '主线');
}

// 叙事写入的战歌不在上面七阶表里，单独列出，避免变量里有看不见的节点
const 其他战歌 = computed(() => 键(技能树.战歌树).filter(k => !全部战歌名.has(k)));

const BODY_SOURCE: Record<string, string> = {
  龙力系: '龙宠战死后的血之祭奠嫁接',
  花系: '花系魔法副作用',
  金刚伏魔之力: '佛门武学体系',
  秘银断臂: '为救艾薇尔挥刀断臂后装上的秘银手臂',
};

const body_rows = computed(() => {
  const y = 主角.异体原 as Record<string, any>;
  const known = Object.keys(BODY_SOURCE);
  const names = [...known, ...键(技能树.异体原).filter(k => !known.includes(k))];
  return names.map(name => ({
    name,
    from: BODY_SOURCE[name] ?? '叙事中新增的成长线',
    当前:
      name === '秘银断臂'
        ? y.秘银断臂 === true
          ? '已装上'
          : '未装上'
        : Number(y[name] ?? 0) > 0
          ? `已获得（${y[name]}）`
          : '未获得',
  }));
});

function 成长解锁(name: string) {
  return 技能树.异体原[name]?.解锁 === true;
}

function 成长层级(name: string) {
  return 技能树.异体原[name]?.层级 ?? 0;
}

function 切换成长(name: string) {
  const t = 技能树.异体原;
  const v = t[name];
  if (!v) {
    t[name] = { 解锁: true, 层级: 0 };
    留痕(`解锁异体原「${name}」。`, '私人');
    return;
  }
  v.解锁 = v.解锁 !== true;
  留痕(`${v.解锁 ? '解锁' : '封存'}异体原「${name}」。`, '私人');
}

function 升级成长(name: string) {
  const v = 技能树.异体原[name];
  if (!v) return;
  v.层级 = Math.min(99, (v.层级 ?? 0) + 1);
  留痕(`异体原「${name}」推进到第 ${v.层级} 层。`, '私人');
}

const army_units = [
  { name: '比蒙战士', desc: '基础步兵，可升级为精锐战士与狂暴战士' },
  { name: '猛犸骑兵', desc: '重装冲击骑兵，人口稀缺，需泰穆尔拉雅募兵' },
  { name: '俄勒芬巨象勇士', desc: '力量顶点单位，皮肤坚硬' },
  { name: '熊猫武士', desc: '潘塔族，可升级为东方护卫' },
  { name: '麝人弹弓手', desc: '远程投掷单位' },
  { name: '匹格族豪猪掷矛手', desc: '远程' },
  { name: '狼骑兵', desc: '沃尔夫族米格军团主力' },
  { name: '狈族萨满随军', desc: '沙罗曼祭祀，随军为狼骑兵加持' },
  { name: '天鹅族骑士', desc: '斯迈族失去飞翔能力后转为地面骑士，独有禁空之歌' },
  { name: '螳螂刀圣', desc: '绿党族，不能狂化' },
];
const 全部兵种名 = new Set(army_units.map(u => u.name));

const army_all = computed(() => [
  ...army_units,
  ...键(技能树.兵种树)
    .filter(k => !全部兵种名.has(k))
    .map(name => ({ name, desc: '叙事中新增的兵种' })),
]);

function 兵种解锁(name: string) {
  return 技能树.兵种树[name]?.解锁 === true;
}

function 兵种等级(name: string) {
  return 技能树.兵种树[name]?.等级 ?? 0;
}

function 兵种训练度(name: string) {
  return 技能树.兵种树[name]?.训练度 ?? 0;
}

function 切换兵种(name: string) {
  const t = 技能树.兵种树;
  const v = t[name];
  if (!v) {
    t[name] = { 解锁: true, 等级: 0, 训练度: 0 };
    留痕(`兵种树解锁「${name}」。`, '领地');
    return;
  }
  v.解锁 = v.解锁 !== true;
  留痕(`${v.解锁 ? '解锁' : '封存'}兵种「${name}」。`, '领地');
}

function 升级兵种(name: string) {
  const v = 技能树.兵种树[name];
  if (!v) return;
  v.等级 = Math.min(99, (v.等级 ?? 0) + 1);
  留痕(`兵种「${name}」等级升至 ${v.等级}（新兵 → 老兵 → 精锐 → 王牌）。`, '领地');
}

function 训练兵种(name: string) {
  const v = 技能树.兵种树[name];
  if (!v) return;
  v.训练度 = Math.min(100, (v.训练度 ?? 0) + 5);
  留痕(`兵种「${name}」训练度升至 ${v.训练度}。`, '领地');
}

function 兵力(name: string) {
  const v = (领地.兵力 ?? {})[name];
  if (v === undefined || v === null) return '';
  return typeof v === 'number' ? String(v) : String(v.数量 ?? '');
}

const tech_nodes = [
  { name: '祭祀学院', desc: '剑桥祭祀学院，培养技战术打法' },
  { name: '祭坛', desc: '圣坛祭祀施法与冥想的场所，提升歌力恢复' },
  { name: '战歌图腾柱', desc: '可构筑中级魔法免疫结界' },
  { name: '神曲光环', desc: '神曲萨满专属，加持于主神庙；历届神曲萨满只用于宗教建筑' },
  { name: '摩云磁暴灯', desc: '地底军工体系产物' },
  { name: '地底兵工厂', desc: '依托地底世界资源，量产武器与装备' },
  { name: '姜之忍耐夔鼓', desc: '夔牛皮绷制战鼓，每敲九十九下爆发耐力光环与迟钝光环' },
  { name: '魔法传送阵', desc: '炼金术士制作的固定传送阵，是规模化后勤的前提' },
];
const 主链 = tech_nodes.slice(0, 4).map(t => t.name);

const tech_all = computed(() => {
  const known = new Set(tech_nodes.map(t => t.name));
  return [
    ...tech_nodes,
    ...键(技能树.领地科技树)
      .filter(k => !known.has(k))
      .map(name => ({ name, desc: '叙事中新增的科技节点' })),
  ];
});

// 造价取自世界观的资源消耗条目：木材/石料/铁矿/魔晶/金币
const 科技基价: Record<string, Record<string, number>> = {
  祭祀学院: { 金币: 80, 木材: 60, 石料: 40 },
  祭坛: { 金币: 140, 石料: 120, 铁: 30 },
  战歌图腾柱: { 木材: 160, 石料: 60, 铁: 40 },
  神曲光环: { 金币: 260, 魔晶: 60, 精金: 20 },
  摩云磁暴灯: { 铁: 90, 魔晶: 40 },
  地底兵工厂: { 铁: 140, 石料: 100, 金币: 200 },
  姜之忍耐夔鼓: { 魔晶: 50, 铁: 40, 金币: 120 },
  魔法传送阵: { 魔晶: 120, 精金: 30, 石料: 80 },
};

function 科技等级(name: string) {
  return 技能树.领地科技树[name]?.等级 ?? 0;
}

/** 三态由 解锁 + 等级 推出：schema 的科技节点只有这两个字段，不能写额外状态字段 */
function 科技状态(name: string): '未解锁' | '成长中' | '已解锁' {
  const v = 技能树.领地科技树[name];
  if (!v || v.解锁 !== true) return '未解锁';
  return (v.等级 ?? 0) > 0 ? '已解锁' : '成长中';
}

function 科技标签类(name: string) {
  const s = 科技状态(name);
  return s === '已解锁' ? 'sb-tag-terra' : s === '成长中' ? 'sb-tag-song' : 'sb-tag-void';
}

function 科技消耗(name: string) {
  const 基 = 科技基价[name] ?? { 金币: 100, 木材: 60, 石料: 50 };
  const 倍 = 1 + 科技等级(name);
  return Object.fromEntries(Object.entries(基).map(([k, v]) => [k, v * 倍]));
}

function 消耗文本(消耗: Record<string, number>) {
  return Object.entries(消耗)
    .map(([k, v]) => `${k} ${v}`)
    .join(' · ');
}

// 资源表在 schema 里是枚举键的 record，按动态键名扣减时统一收口成普通索引
function 花得起(消耗: Record<string, number>) {
  const 库 = 领地.资源 as Record<string, number>;
  return Object.entries(消耗).every(([k, v]) => (库[k] ?? 0) >= v);
}

function 扣资源(消耗: Record<string, number>) {
  const 库 = 领地.资源 as Record<string, number>;
  for (const [k, v] of Object.entries(消耗)) 库[k] = (库[k] ?? 0) - v;
}

/** 主链断环时后续节点无法解锁：只读判断，不额外记变量 */
function 前置满足(name: string) {
  const i = 主链.indexOf(name);
  if (i <= 0) return true;
  return 科技状态(主链[i - 1]) === '已解锁';
}

function 科技可推进(name: string) {
  return 科技状态(name) !== '已解锁' && 前置满足(name) && 花得起(科技消耗(name));
}

function 科技下一步(name: string) {
  const s = 科技状态(name);
  return s === '未解锁' ? '开工建造' : s === '成长中' ? '完工交付' : '已完工';
}

function 科技说明(name: string) {
  if (科技状态(name) === '已解锁') return '已完工，可用「等级 +1」继续扩建';
  if (!前置满足(name)) return '主链前置节点尚未完工';
  if (!花得起(科技消耗(name))) return '资源不足，请先在领地面板补给';
  return '点击推进建设阶段';
}

function 推进科技(name: string) {
  const s = 科技状态(name);
  if (s === '已解锁') return;
  const 消耗 = 科技消耗(name);
  if (!前置满足(name) || !花得起(消耗)) return;
  扣资源(消耗);
  const t = 技能树.领地科技树;
  if (!t[name]) t[name] = { 解锁: true, 等级: 0 };
  t[name].解锁 = true;
  if (s === '未解锁') {
    留痕(`领地开工建造「${name}」，消耗 ${消耗文本(消耗)}。`, '领地');
    return;
  }
  // 未解锁 → 成长中 → 已解锁：完工交付时把等级抬到 1 才算落地
  t[name].等级 = Math.max(1, t[name].等级 ?? 0);
  留痕(`领地科技「${name}」完工交付，等级 ${t[name].等级}。`, '领地');
}

function 扩建科技(name: string) {
  const v = 技能树.领地科技树[name];
  // 只有已完工的节点谈得上扩建，成长中的先走「完工交付」
  if (!v || 科技状态(name) !== '已解锁') return;
  const 消耗 = 科技消耗(name);
  if (!花得起(消耗)) return;
  扣资源(消耗);
  v.等级 = Math.min(99, (v.等级 ?? 0) + 1);
  留痕(`领地科技「${name}」扩建至 Lv.${v.等级}，消耗 ${消耗文本(消耗)}。`, '领地');
}

type 自定义状态 = '未解锁' | '已解锁' | '成长中';
const 状态选项: 自定义状态[] = ['未解锁', '已解锁', '成长中'];
// 推进按 未解锁 → 成长中 → 已解锁，走到头停住，不倒退
const 状态序: 自定义状态[] = ['未解锁', '成长中', '已解锁'];

const 自定义表单 = ref({ 名称: '', 说明: '', 消耗: '', 状态: '未解锁' as 自定义状态 });
const 自定义列表 = computed(() => 列(技能树.自定义));

function 下一个自定义状态(状态: string) {
  const i = 状态序.indexOf(状态 as 自定义状态);
  return i < 0 ? '成长中' : 状态序[Math.min(状态序.length - 1, i + 1)];
}

function 自定义标签类(状态: string) {
  return 状态 === '已解锁' ? 'sb-tag-terra' : 状态 === '成长中' ? 'sb-tag-song' : 'sb-tag-void';
}

function 新增自定义() {
  const 名 = 自定义表单.value.名称.trim();
  if (!名) return;
  const 表 = 技能树.自定义;
  // 重名自动加序号，避免静默覆盖玩家已有节点
  let 键名 = 名;
  let i = 2;
  while (表[键名]) 键名 = `${名}(${i++})`;
  表[键名] = {
    说明: 自定义表单.value.说明.trim(),
    消耗: 自定义表单.value.消耗.trim(),
    状态: 自定义表单.value.状态,
  };
  留痕(`新增自定义节点「${键名}」，状态 ${自定义表单.value.状态}。`, '私人');
  自定义表单.value.名称 = '';
  自定义表单.value.说明 = '';
  自定义表单.value.消耗 = '';
  自定义表单.value.状态 = '未解锁';
}

function 推进自定义(名: string) {
  const v = 技能树.自定义[名];
  if (!v) return;
  const 下一个 = 下一个自定义状态(v.状态) as 自定义状态;
  if (下一个 === v.状态) return;
  v.状态 = 下一个;
  留痕(`自定义节点「${名}」状态变为 ${下一个}。`, '私人');
}

function 删自定义(名: string) {
  delete 技能树.自定义[名];
  留痕(`删除自定义节点「${名}」。`, '私人');
}

function 树已解锁(id: string) {
  const 表: Record<string, any> = {
    song: 技能树.战歌树,
    body: 技能树.异体原,
    army: 技能树.兵种树,
    tech: 技能树.领地科技树,
    custom: 技能树.自定义,
  };
  return Object.values(表[id] ?? {}).filter(
    v => (v as any)?.解锁 === true || (v as any)?.状态 === '已解锁',
  ).length;
}
</script>

<style lang="scss" scoped>
.tree-pick {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tree-pick .sb-btn.on {
  border-color: var(--sb-song);
  color: var(--sb-song);
}

.tier-wrap {
  margin-bottom: 7px;
}

.tier-head {
  font-size: 12px;
  color: var(--sb-dim);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
}

.tier-head.reached {
  color: var(--sb-song);
}

.nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 节点与它的 +5 按钮成组，避免换行时脱开 */
.node-cell {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.node-cell .sb-node {
  font-family: var(--sb-font);
  cursor: pointer;
}

.node-cell .sb-node:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.mini {
  font-size: 10px;
  padding: 1px 4px;
}

.lv {
  font-size: 10px;
  margin-left: 3px;
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

.extra {
  margin-top: 6px;
}

.hint {
  margin-top: 7px;
  font-size: 11px;
  border-top: 1px dashed var(--sb-line);
  padding-top: 5px;
}

.tech-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.arrow {
  color: var(--sb-dim);
  font-size: 10px;
}

/* 表单沿用战报面板的深色输入风格，但作用域留在本组件 */
.form {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ipt {
  background: #0d0b08;
  border: 1px solid var(--sb-line);
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 12px;
  padding: 2px 5px;
  min-width: 0;
  flex: 1 1 92px;
}

.ipt.wide {
  flex: 1 1 150px;
}

.ipt.sel {
  flex: 0 0 84px;
}

/* 节点里的层级下拉要能塞进 .nodes 的流式布局，所以比表单里的更窄 */
.ipt.sel.mini {
  flex: 0 0 auto;
  width: 62px;
  padding: 1px 2px;
}

.ipt:focus {
  outline: none;
  border-color: var(--sb-song);
}
</style>
