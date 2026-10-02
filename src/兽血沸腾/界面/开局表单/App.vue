<template>
  <div class="sb-root form-root">
    <header class="fh">
      <div class="ft">兽血沸腾 · 开局设定</div>
      <div class="fs sb-dim">
        身份决定你的起点、初始阶位与已结识的人。留空项由系统按所选开局填默认值。
      </div>
    </header>

    <div class="sb-pad">
      <!-- 开局点 -->
      <div class="sb-sec">
        <div class="sb-sec-title">一 · 选择开局点</div>
        <div class="openings">
          <label v-for="o in OPENINGS" :key="o.id" class="op" :class="{ on: form.opening === o.id }">
            <input v-model="form.opening" type="radio" :value="o.id" />
            <div class="ol">
              <b>{{ o.name }}</b>
              <span class="sb-tag sb-tag-song">{{ o.vol }}</span>
              <div class="od sb-dim">{{ o.desc }}</div>
            </div>
          </label>
        </div>
      </div>

      <!-- 自定义开局 -->
      <div class="sb-sec">
        <div class="sb-sec-title">二 · 自定义开局（可选，覆盖上面的开局点）</div>
        <div class="frow">
          <label>起始章节序号</label>
          <input v-model.number="form.章节序号" type="number" min="0" max="763" placeholder="0–763" />
          <span class="sb-dim">0 起算，共 764 章</span>
        </div>
        <div class="frow">
          <label>起始区域</label>
          <input v-model="form.区域" type="text" placeholder="如：多瑙大荒原 / 翡冷翠 / 威瑟斯庞" />
        </div>
        <div class="frow">
          <label>起始场景</label>
          <input v-model="form.场景" type="text" placeholder="如：博格村外红土坡" />
        </div>
      </div>

      <!-- 身份 -->
      <div class="sb-sec">
        <div class="sb-sec-title">三 · 你的身份</div>
        <div class="frow">
          <label>扮演视角</label>
          <select v-model="form.视角">
            <option value="刘震撼">刘震撼（原作主角，已备完整设定）</option>
            <option value="海伦.列娜">海伦.列娜（福克斯族狐人祭祀）</option>
            <option value="凝玉">凝玉（摩韶族蚌人幻术师）</option>
            <option value="艾薇尔">艾薇尔（西雅海国美人鱼公主）</option>
            <option value="自定义">自定义角色（外来客 / 原创人物）</option>
          </select>
        </div>
        <div class="frow" v-if="form.视角 !== '自定义'">
          <span class="sb-dim">由 {{ 玩家名 }} 扮演所选角色：谁被选中，谁的世界书设定就是玩家本人的设定，性格底色照演，不写成道德完人。未被扮演的角色（含刘震撼）一律按各自条目作为 NPC 行动。</span>
        </div>

        <template v-if="form.视角 === '自定义'">
          <div class="frow">
            <label>姓名</label>
            <input v-model="form.姓名" type="text" placeholder="留空则由 AI 按开局生成" />
          </div>
          <div class="frow">
            <label>种族</label>
            <select v-model="form.种族">
              <option v-for="r in RACES" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="frow">
            <label>出身</label>
            <input v-model="form.出身" type="text" placeholder="如：南疆侦察兵 / 剑桥祭祀学院学徒" />
          </div>
          <div class="frow">
            <label>初始阶位</label>
            <select v-model="form.阶位">
              <option v-for="t in TIERS" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </template>
      </div>

      <!-- 玩法偏好 -->
      <div class="sb-sec">
        <div class="sb-sec-title">四 · 玩法偏好</div>
        <div class="frow">
          <label>侧重体验</label>
          <select v-model="form.侧重">
            <option v-for="e in EXP" :key="e" :value="e">{{ e }}</option>
          </select>
        </div>
        <div class="frow">
          <label>难度</label>
          <select v-model="form.难度">
            <option value="轻松">轻松（少战多日常）</option>
            <option value="标准">标准（按原作节奏）</option>
            <option value="硬核">硬核（战争与死亡不避让）</option>
          </select>
        </div>
        <div class="frow">
          <label>NSFW 尺度</label>
          <select v-model="form.尺度">
            <option value="全开">全开（贴近原作）</option>
            <option value="淡化">淡化（只写情节不写过程）</option>
            <option value="关闭">关闭</option>
          </select>
        </div>
        <div class="frow check">
          <label>
            <input v-model="form.孕事系统" type="checkbox" />
            开启孕事系统（怀孕、孕期分期、子嗣档案）
          </label>
        </div>
        <div class="frow check">
          <label>
            <input v-model="form.战斗自动结算" type="checkbox" />
            战斗由前端自动结算（关闭则每回合手动点结算）
          </label>
        </div>
      </div>

      <!-- 自由输入 -->
      <div class="sb-sec">
        <div class="sb-sec-title">五 · 补充设定（可选）</div>
        <textarea
          v-model="form.补充"
          rows="3"
          placeholder="任何你想追加的设定：自带人设、已发生的关系、想避开的内容、想要的剧情走向……"
        />
      </div>

      <div class="submit-row">
        <button class="sb-btn sb-btn-song" :disabled="submitting" @click="提交">
          <i class="fa-solid fa-play" /> {{ submitting ? '正在开局…' : '以此设定开始' }}
        </button>
        <span class="sb-dim">提交后会用你的设定写入变量，并触发 AI 铺开对应场景。</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();

// 玩家名：取酒馆 persona 名（表单文案里指代玩家本人）
const 玩家名 = computed(() => window.SillyTavern?.getContext?.().name1 || '玩家');

// 与 开场白/2~6.txt 一一对应；表单提交后把玩家选择写回变量，再由 AI 按对应落点铺开
const OPENINGS = [
  {
    id: '荒岛',
    name: '荒岛求生',
    vol: '荒岛篇 · 第 1 章',
    desc: '你在一片无名荒岛上醒来，身边只有一头浑身瓦蓝的巨狼和头顶那团金毛。',
  },
  {
    id: '海上',
    name: '西雅海域蓬莱号',
    vol: '海上篇 · 第 7 章',
    desc: '你站在蓬莱号甲板上，十二骑加布林魔鲨截住去路，海族要船上交出两个人。',
  },
  {
    id: '多瑙大荒原',
    name: '威瑟斯庞城外荒道',
    vol: '多瑙大荒原篇 · 第 1 章',
    desc: '你走在多瑙大荒原的土道上，五个比蒙拦路查验，没有作保的进不了城。',
  },
  {
    id: '翡冷翠',
    name: '翡冷翠领主的议事厅',
    vol: '纵横篇 · 第 185 章',
    desc: '你已经是翡冷翠领主。桑干河南岸五百里红土高原是你的，账册摊在桌上，要盘的事排到了明年。',
  },
  {
    id: '决战',
    name: '桑干河前线决战前夜',
    vol: '纵横篇 · 终盘',
    desc: '决战前夜。时空大裂缝的残余禁制压在荒原上，魔族三路进兵已在沿岸集结完毕。',
  },
];

const RACES = [
  '匹格族（猪头人）',
  '沃尔夫族（狼人）',
  '斯迈族（天鹅）',
  '福克斯族（狐狸）',
  '潘塔族（熊猫）',
  '俄勒芬族（巨象）',
  '莱茵族（狮子）',
  '道格族（狗头人）',
  '人类',
  '精灵',
  '海族',
  '龙族',
  '唐藏人',
  '矮人',
];

const TIERS = [
  '无',
  '风语祭祀',
  '灵魂祭祀',
  '战争祭祀',
  '权杖祭祀',
  '维安大萨满',
  '十二主祭',
  '红衣大祭司',
];

const EXP = ['均衡', '主线史诗重演', '角色关系养成', '翡冷翠领地经营', '自由冒险沙盒'];

const form = reactive({
  opening: '荒岛',
  章节序号: null as number | null,
  区域: '',
  场景: '',
  视角: '刘震撼',
  姓名: '',
  种族: '匹格族（猪头人）',
  出身: '',
  阶位: '无',
  侧重: '均衡',
  难度: '标准',
  尺度: '全开',
  孕事系统: true,
  战斗自动结算: true,
  补充: '',
});

const submitting = ref(false);

// 每个开局点的默认落点，用于回填变量
const PRESET: Record<string, { 卷: string; 章节: number; 区域: string; 场景: string; 阶位: string; 身份: string }> = {
  荒岛: { 卷: '荒岛篇', 章节: 0, 区域: '荒岛', 场景: '无名荒岛海岸', 阶位: '无', 身份: '匹格族族人，落难荒岛的外来者' },
  胸罩岛: {
    卷: '胸罩岛篇',
    章节: 10,
    区域: '胸罩岛',
    场景: '胸罩岛密林',
    阶位: '无',
    身份: '天生的灵魂歌者，尚未入神庙受阶的祭祀学徒',
  },
  海上: { 卷: '海上篇', 章节: 27, 区域: '西雅海域', 场景: '蓬莱号甲板', 阶位: '无', 身份: '天生的灵魂歌者，自封亚龙祭祀，尚未受阶' },
  多瑙大荒原: {
    卷: '多瑙大荒原篇',
    章节: 31,
    区域: '多瑙大荒原',
    场景: '威瑟斯庞城外荒道',
    阶位: '无',
    身份: '天生的灵魂歌者，尚未落籍受阶的比蒙祭祀',
  },
  翡冷翠: {
    卷: '比蒙王国纵横',
    章节: 245,
    区域: '翡冷翠',
    场景: '领主府议事厅',
    阶位: '战争祭祀',
    身份: '翡冷翠领主，桑干河南岸五百里红土高原之主',
  },
  决战: {
    卷: '比蒙王国纵横',
    章节: 747,
    区域: '桑干河前线',
    场景: '决战大营中军帐',
    阶位: '战争祭祀',
    身份: '比蒙王国战争祭祀、神曲萨满，翡冷翠领主，决战统帅之一',
  },
};

async function 提交() {
  submitting.value = true;
  try {
    const p = PRESET[form.opening] ?? PRESET['荒岛'];
    const d = store.data;

    // 剧情落点
    d.剧情.当前卷 = p.卷;
    d.剧情.章节序号 = form.章节序号 ?? p.章节;
    d.世界.当前区域 = form.区域 || p.区域;
    d.世界.当前场景 = form.场景 || p.场景;

    // 主角身份：玩家扮演谁由 名称 给出；核心角色的具体身份以世界书条目按当前章节为准
    const 核心角色 = ['刘震撼', '海伦.列娜', '凝玉', '艾薇尔'];
    const 角色默认阶位: Record<string, string> = { '海伦.列娜': '灵魂祭祀', 凝玉: '无', 艾薇尔: '无' };
    if (form.视角 === '自定义') {
      d.主角.名称 = form.姓名 || '';
      d.主角.阶位 = form.阶位;
      d.主角.身份 = `${form.种族}，${form.出身 || '来历不明'}${form.姓名 ? `，名 ${form.姓名}` : ''}`;
    } else {
      d.主角.名称 = form.视角;
      d.主角.阶位 = form.视角 === '刘震撼' ? p.阶位 : 角色默认阶位[form.视角] ?? '无';
      d.主角.身份 = `${form.视角}（由玩家扮演），当前身份与处境以世界书条目按章节序号 ${d.剧情.章节序号} 的分档为准`;
    }

    // 玩法偏好写入开关与难度
    d.系统.难度 = form.难度;
    d.系统.规则开关.孕事系统 = form.孕事系统;
    d.系统.规则开关.战斗自动结算 = form.战斗自动结算;

    // 自定义项与偏好要落到 玩家自定义，否则刷新后无从追溯玩家当初选了什么
    const 自定义 = d.系统.玩家自定义;
    自定义['开局点'] = OPENINGS.find(o => o.id === form.opening)?.name ?? form.opening;
    自定义['侧重体验'] = form.侧重;
    自定义['NSFW 尺度'] = form.尺度;
    自定义['扮演视角'] = form.视角;
    if (form.视角 === '自定义') {
      自定义['姓名'] = form.姓名 || '（由 AI 生成）';
      自定义['种族'] = form.种族;
      自定义['出身'] = form.出身 || '（由 AI 生成）';
    }
    if (form.补充) 自定义['补充设定'] = form.补充;

    const 摘要 = [
      `开局点：${OPENINGS.find(o => o.id === form.opening)?.name ?? form.opening}`,
      `起始：${d.剧情.当前卷} 第 ${d.剧情.章节序号} 章 · ${d.世界.当前区域} · ${d.世界.当前场景}`,
      `扮演：{{user}} 即 ${d.主角.名称 || '自定义角色'}，其世界书设定就是 {{user}} 本人的设定`,
      `阶位：${d.主角.阶位}`,
      `侧重：${form.侧重}`,
      `难度：${form.难度}`,
      `NSFW：${form.尺度}`,
      form.补充 ? `补充设定：${form.补充}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    await createChatMessages([
      {
        role: 'user',
        message: 摘要,
      },
    ]);
    triggerSlash('/trigger');
  } catch (e) {
    console.error(e);
    toastr.error('开局提交失败，请查看控制台。');
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.form-root {
  max-width: 640px;
}

.fh {
  padding: 9px 12px;
  background: linear-gradient(180deg, #221c14, var(--sb-panel));
  border-bottom: 1px solid var(--sb-line);
}

.ft {
  font-size: 15px;
  font-weight: bold;
  color: var(--sb-song);
  letter-spacing: 1px;
}

.fs {
  font-size: 11px;
  margin-top: 3px;
}

.sb-pad > * + * {
  margin-top: 8px;
}

.openings {
  display: grid;
  gap: 5px;
}

.op {
  display: flex;
  gap: 7px;
  align-items: flex-start;
  border: 1px solid var(--sb-line);
  background: var(--sb-bg);
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.18s;
}

.op:hover {
  border-color: var(--sb-song);
}

.op.on {
  border-color: var(--sb-song);
  background: #221c14;
}

.op input {
  margin-top: 3px;
  accent-color: var(--sb-song);
  flex: none;
}

.ol {
  flex: 1;
  min-width: 0;
}

.ol b {
  font-size: 13px;
  margin-right: 5px;
}

.od {
  font-size: 11px;
  margin-top: 2px;
}

.frow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.frow > label {
  flex: none;
  width: 84px;
  color: var(--sb-dim);
  font-size: 12px;
}

.frow input[type='text'],
.frow input[type='number'],
.frow select,
textarea {
  flex: 1;
  min-width: 160px;
  background: var(--sb-bg);
  border: 1px solid var(--sb-line);
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 12px;
  padding: 3px 6px;
  outline: none;
}

.frow input:focus,
.frow select:focus,
textarea:focus {
  border-color: var(--sb-song);
}

.frow.check {
  align-items: flex-start;
}

.frow.check label {
  width: auto;
  flex: 1;
  color: var(--sb-text);
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
}

.frow.check input {
  accent-color: var(--sb-song);
}

textarea {
  width: 100%;
  resize: vertical;
  line-height: 1.5;
}

.submit-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 2px;
}

.submit-row .sb-btn {
  font-size: 13px;
  padding: 6px 18px;
}

.submit-row .sb-dim {
  font-size: 11px;
  flex: 1;
  min-width: 140px;
}
</style>
