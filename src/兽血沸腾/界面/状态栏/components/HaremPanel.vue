<template>
  <div>
    <!-- 开关关闭时不隐藏面板：孕事停摆，但亲密度与亲密记录仍可写 -->
    <div v-if="!preg_on" class="sb-sec">
      <div class="sb-sec-title">后宫与孕事 · 孕事系统已关闭</div>
      <div class="sb-empty">
        孕事停止推进，临产者会长期停在临产档；已有条目保留原值，不推进也不清除。
        亲密度微调与亲密记录不受影响。可在「总览」页签重新开启开关。
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">
        孕事 · 进行中 {{ activePreg.length }} 人
        <span class="sb-tag sb-tag-bond">分期：确诊 → 显怀 → 临产 → 分娩</span>
        <span v-if="!preg_on" class="sb-tag sb-tag-life">已停摆</span>
      </div>
      <div v-if="!activePreg.length" class="sb-empty">当前无进行中的孕事。</div>
      <div v-else class="cards">
        <div v-for="p in activePreg" :key="p.名" class="c">
          <div class="chead">
            <b>{{ p.名 }}</b>
            <span class="sb-tag sb-tag-bond">{{ p.状态 || '未知' }}</span>
            <span class="sb-dim">{{ p.孕期 || '孕期未记' }}</span>
          </div>

          <div class="stage">
            <span v-for="(s, i) in 孕事阶段" :key="s" class="st" :class="{ on: i <= p.idx, now: i === p.idx }">
              {{ s }}
            </span>
          </div>

          <div class="kv">
            <div class="tnum">
              <span class="sb-dim">胎数</span>
              <button class="sb-btn mini" :disabled="!preg_on || p.胎数 <= 0" @click="调胎数(p.名, -1)">−</button>
              <span class="sb-num">{{ p.胎数 }}</span>
              <button class="sb-btn mini" :disabled="!preg_on || p.胎数 >= 12" @click="调胎数(p.名, 1)">＋</button>
            </div>
            <div><span class="sb-dim">预产期</span>{{ p.预产期 || '未定' }}</div>
          </div>

          <div class="ctl">
            <button class="sb-btn sb-btn-song" :disabled="!preg_on" @click="推进孕事(p.名)">
              {{ 下一阶段(p.状态) ? `推进 → ${下一阶段(p.状态)}` : '接生 · 登记入子嗣' }}
            </button>
          </div>

          <!-- 只在分娩档暴露登记字段，避免误填尚未出生的子嗣 -->
          <div v-if="p.状态 === '分娩'" class="reg">
            <input
              class="sb-in"
              :value="登记表[p.名]?.姓名 ?? ''"
              placeholder="子嗣姓名"
              @input="写登记(p.名, '姓名', $event)"
            />
            <input
              class="sb-in"
              :value="登记表[p.名]?.特征 ?? ''"
              placeholder="特征"
              @input="写登记(p.名, '特征', $event)"
            />
            <input
              class="sb-in"
              :value="登记表[p.名]?.天赋 ?? ''"
              placeholder="天赋"
              @input="写登记(p.名, '天赋', $event)"
            />
            <input
              class="sb-in"
              :value="登记表[p.名]?.名分 ?? ''"
              placeholder="名分"
              @input="写登记(p.名, '名分', $event)"
            />
            <div class="sb-dim">种族取成员记录；留空字段由 AI 在叙事中补写。</div>
          </div>
        </div>
      </div>
      <div class="sb-dim hint">孕期按世界日期推进；分娩后记录从孕事移入子嗣，并清空对应孕事条目。</div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">后宫成员 · {{ 成员列表.length }} 人</div>
      <div v-if="!成员列表.length" class="sb-empty">关系阶段达到相爱并完成明确的关系确认事件后写入成员清单。</div>
      <table v-else class="sb-tb">
        <thead>
          <tr>
            <th style="width: 18%">姓名</th>
            <th style="width: 14%">种族</th>
            <th style="width: 22%">身份</th>
            <th style="width: 14%">关系阶段</th>
            <th>加入章节</th>
            <th style="width: 22%">推进</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in 成员列表" :key="m.名称">
            <td>{{ m.名称 }}</td>
            <td class="sb-dim">{{ m.种族 || '—' }}</td>
            <td class="sb-dim">{{ m.身份 || '—' }}</td>
            <td>{{ m.关系阶段 || '—' }}</td>
            <td class="sb-num">{{ m.加入章节 || '—' }}</td>
            <td>
              <button class="sb-btn mini sb-btn-bond" :disabled="!下一成员阶段(m.关系阶段)" @click="推进成员(m.名称)">
                {{ 下一成员阶段(m.关系阶段) ? `→ ${下一成员阶段(m.关系阶段)}` : '已至妻子' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="sb-dim hint">
        成员的关系阶段是自由文本，推进时写入的仍是关系枚举档位（{{ 阶段序.join(' / ') }}）；
        同名关系条目会一并同步，保证两处不打架。疏离属叙事旁支，需由 AI 按剧情写入。
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">子嗣 · {{ 子嗣列表.length }} 人</div>
      <div v-if="!子嗣列表.length" class="sb-empty">尚无子嗣记录。</div>
      <table v-else class="sb-tb">
        <thead>
          <tr>
            <th style="width: 16%">姓名</th>
            <th style="width: 14%">母亲</th>
            <th style="width: 12%">种族</th>
            <th style="width: 8%">年龄</th>
            <th style="width: 16%">天赋</th>
            <th style="width: 16%">特征</th>
            <th>名分</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in 子嗣列表" :key="c.名称">
            <td>{{ c.名称 }}</td>
            <td class="sb-dim">{{ c.母亲 || '—' }}</td>
            <td class="sb-dim">{{ c.种族 || '—' }}</td>
            <td class="sb-num">{{ c.年龄 ?? '—' }}</td>
            <td class="sb-dim">{{ c.天赋 || '—' }}</td>
            <td class="sb-dim">{{ c.特征 || '—' }}</td>
            <td class="sb-dim">{{ c.名分 || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">
        亲密度微调 · {{ 关系列表.length }} 人
        <span class="sb-dim">每次 ±5，写入该角色的已触发互动便于 AI 回看</span>
      </div>
      <div v-if="!关系列表.length" class="sb-empty">尚无关系记录。</div>
      <div v-else class="tunes">
        <div v-for="r in 关系列表" :key="r.名" class="tune">
          <div class="thead">
            <b>{{ r.名 }}</b>
            <span class="sb-tag sb-tag-bond">{{ r.关系阶段 }}</span>
          </div>
          <div v-for="k in 数值键" :key="k" class="line">
            <span class="lbl">{{ k }}</span>
            <button class="sb-btn mini sb-btn-bond" :disabled="!可减(r.名, k)" @click="微调(r.名, k, -5)">−5</button>
            <div class="sb-bar sb-bar-bond"><i :style="{ width: 条宽(k, r[k]) }" /></div>
            <span class="sb-num v">{{ r[k] }}</span>
            <button class="sb-btn mini sb-btn-bond" :disabled="!可增(r.名, k)" @click="微调(r.名, k, 5)">＋5</button>
          </div>
        </div>
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">
        私密档位 · {{ 档位列表.length }} 人
        <span class="sb-dim">由私密阶段条目定义；好感度轴随关系走，章节轴随世界进度走</span>
      </div>
      <div v-if="!档位列表.length" class="sb-empty">
        尚无进入档位的角色。关系轴的角色需先建立关系条目，章节轴的角色随主线推进自动升档。
      </div>
      <div v-else class="tiers">
        <div v-for="t in 档位列表" :key="t.名" class="tier">
          <div class="thead">
            <b>{{ t.名 }}</b>
            <span class="sb-tag sb-tag-bond">{{ t.当前 }}</span>
            <span class="sb-dim">{{ t.轴 }}{{ t.下一档 === null ? ' · 已至末档' : ` · 下一档 ${t.下一档}` }}</span>
          </div>
          <div class="steps">
            <span
              v-for="(n, i) in t.档名"
              :key="n"
              class="step"
              :class="{ on: i <= t.idx, cur: i === t.idx }"
              :title="`第 ${i + 1} 档`"
            >
              {{ n }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">
        房事底账 · {{ 房事列表.length }} 人
        <span class="sb-dim"> 部位名取自该角色自己的 私密档案；熟练、性癖与床评写回 关系.X.房事 </span>
      </div>
      <div v-if="!房事列表.length" class="sb-empty">
        尚无房事记录。房事条目只对已建立关系、且写有 私密档案 的角色开启。
      </div>
      <div v-else class="beds">
        <div v-for="b in 房事列表" :key="b.名" class="bed">
          <div class="thead">
            <b>{{ b.名 }}</b>
            <span class="sb-tag sb-tag-life">{{ 档位(b.名)?.当前 || b.关系阶段 }}</span>
            <span class="sb-dim">侍寝 {{ b.侍寝次数 }} 次 · 最近 {{ b.最近 || '—' }}</span>
            <span class="sb-tag" :class="b.名器觉醒 ? 'sb-tag-song' : 'sb-dim'">
              {{ b.名器觉醒 ? '名器已显' : '名器未显' }}
            </span>
          </div>

          <div class="line">
            <span class="lbl">侍寝</span>
            <button class="sb-btn mini sb-btn-life" @click="加侍寝(b.名, 1)">＋1</button>
            <button class="sb-btn mini" :disabled="b.侍寝次数 <= 0" @click="加侍寝(b.名, -1)">−1</button>
            <span class="lbl">开发</span>
            <div class="sb-bar sb-bar-life"><i :style="{ width: `${b.身体开发}%` }" /></div>
            <span class="sb-num v">{{ b.身体开发 }}</span>
            <button class="sb-btn mini" :disabled="b.身体开发 <= 0" @click="调开发(b.名, -5)">−5</button>
            <button class="sb-btn mini sb-btn-life" :disabled="b.身体开发 >= 100" @click="调开发(b.名, 5)">＋5</button>
            <button class="sb-btn mini" @click="翻名器(b.名)">{{ b.名器觉醒 ? '收回名器' : '显名器' }}</button>
          </div>

          <div class="line">
            <span class="lbl">最近</span>
            <input
              class="sb-in wide"
              :value="b.最近"
              placeholder="最近一次的时间地点与情形"
              @change="写房事(b.名, '最近', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="line">
            <span class="lbl">床评</span>
            <input
              class="sb-in wide"
              :value="b.床评"
              placeholder="她的反应路数与忌讳，照私密档位当前档写"
              @change="写房事(b.名, '床评', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <div class="parts">
            <div v-for="p in b.部位" :key="p.名" class="part" :title="p.备注 || '暂无备注'">
              <span class="pname">{{ p.名 }}</span>
              <div class="sb-bar sb-bar-song"><i :style="{ width: `${p.熟练}%` }" /></div>
              <span class="sb-num">{{ p.熟练 }}</span>
              <button class="sb-btn mini" :disabled="p.熟练 <= 0" @click="调部位(b.名, p.名, -5)">−</button>
              <button class="sb-btn mini sb-btn-song" :disabled="p.熟练 >= 100" @click="调部位(b.名, p.名, 5)">
                ＋
              </button>
            </div>
          </div>

          <div class="line">
            <span class="lbl">性癖</span>
            <span v-for="x in b.性癖" :key="x" class="sb-tag sb-tag-bond">
              {{ x }}
              <i class="fa-solid fa-xmark 删癖" title="删除" @click="删性癖(b.名, x)" />
            </span>
            <input
              class="sb-in"
              :value="癖草稿[b.名] || ''"
              placeholder="追加一条性癖后回车"
              @input="癖草稿[b.名] = ($event.target as HTMLInputElement).value"
              @keyup.enter="加性癖(b.名)"
            />
            <button class="sb-btn mini sb-btn-bond" :disabled="!(癖草稿[b.名] || '').trim()" @click="加性癖(b.名)">
              追加
            </button>
          </div>
        </div>
      </div>
      <div class="sb-dim hint">
        房事的部位名来自各角色自己的 私密档案，异体部位（蚌壳、蛇尾、羽翅、龙角龙尾、珊瑚胶体、九头蛇身……）一并列出。
        熟练度按该处被反复照顾推进，首次触碰不必给高值；床评与私密档位同步，跨档要跟着改。
      </div>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">亲密记录 · {{ 亲密记录列表.length }} 条</div>
      <div class="form">
        <input v-model="记录草稿.对象" class="sb-in" list="harem-rel" placeholder="对象" />
        <datalist id="harem-rel">
          <option v-for="名 in 关系名列表" :key="名" :value="名" />
        </datalist>
        <input v-model="记录草稿.日期" class="sb-in" :placeholder="`日期（默认 ${世界日期}）`" />
        <input v-model="记录草稿.场景" class="sb-in" placeholder="场景" />
        <input v-model="记录草稿.摘要" class="sb-in wide" placeholder="摘要：发生了什么与关键对话" />
        <button
          class="sb-btn sb-btn-song"
          :disabled="!记录草稿.对象.trim() || !记录草稿.摘要.trim()"
          @click="写亲密记录"
        >
          <i class="fa-solid fa-feather" /> 追加记录
        </button>
      </div>
      <div v-if="!亲密记录列表.length" class="sb-empty">尚无记录。</div>
      <table v-else class="sb-tb">
        <thead>
          <tr>
            <th style="width: 16%">对象</th>
            <th style="width: 16%">日期</th>
            <th style="width: 22%">场景</th>
            <th>摘要</th>
            <th style="width: 8%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in 亲密记录列表" :key="r.名称">
            <td>{{ r.对象 || '—' }}</td>
            <td class="sb-num">{{ r.日期 || '—' }}</td>
            <td class="sb-dim">{{ r.场景 || '—' }}</td>
            <td class="sb-dim">{{ r.摘要 || '—' }}</td>
            <td>
              <button class="sb-btn mini sb-btn-life" @click="删记录(r.名称)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="sb-sec">
      <div class="sb-sec-title">亲密判定规则</div>
      <div class="rules sb-dim">
        受主角淫乱度与精力影响 · 受对方好感度、信任与关系阶段门槛约束 · 记录含对象、日期、场景、摘要 ·
        私密档位由各角色的私密阶段条目定义，好感度轴随关系走、章节轴随世界进度走，面板只做显示与对账 ·
        道德约束按种族差异：比蒙除匹格族外生育能力都不理想，人类与精灵观念各异 · 精灵寿命三四千岁，孕期与人类不同 ·
        特殊案例：刘震撼与仙女龙若尔娜的第二个儿子来自数十年后的未来世界
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useDataStore } from '../../store';
import { 列 } from '../../工具';
import { 私密档位表, 当前档位, 下一档阈值 } from '../../私密档位';
import { 部位名列表 } from '../../私密部位';

const store = useDataStore();

const 孕事阶段 = ['确诊', '显怀', '临产', '分娩'];
// 关系里的阶段是枚举，成员里的阶段是自由文本；推进统一按枚举写，避免越界
const 阶段序 = ['初识', '同伴', '相知', '相爱', '妻子', '疏离'] as const;
type 阶段 = (typeof 阶段序)[number];
// 疏离是叙事旁支而非档位，前端只负责沿主线推进，避免一键从妻子绕回初识
const 正向阶段 = ['初识', '同伴', '相知', '相爱', '妻子'] as const;

const 范围 = { 好感度: [-100, 100], 信任度: [-100, 100], 亲密: [0, 100] } as const;
const 数值键 = ['好感度', '信任度', '亲密'] as const;
type 数值键 = (typeof 数值键)[number];

const preg_on = computed(() => store.data.系统.规则开关.孕事系统 !== false);
const 世界日期 = computed(() => String(store.data.世界.日期 ?? ''));

// 后宫集合都是 record：成员/子嗣/亲密记录的名字在 key 上
const 成员列表 = computed(() => 列(store.data.后宫.成员));
const 子嗣列表 = computed(() => 列(store.data.后宫.子嗣));
const 亲密记录列表 = computed(() => 列(store.data.后宫.亲密记录));
const 关系名列表 = computed(() => Object.keys(store.data.关系));

const 关系列表 = computed(() =>
  Object.entries(store.data.关系).map(([名, r]) => ({
    名,
    好感度: Number(r.好感度 ?? 0),
    信任度: Number(r.信任度 ?? 0),
    亲密: Number(r.亲密 ?? 0),
    关系阶段: r.关系阶段,
  })),
);

// 私密档位：条目按轴分档，面板据此显示该角色当前落在哪一档。
// 只有写明 私密阶段.yaml 的角色在表里；章节序号轴的角色即便还没建立关系，也能按世界进度算档。
const 章节序号 = computed(() => Number(store.data.剧情.章节序号 ?? 0));

/** 角色 → 当前档位信息；不在档位表里的角色返回 null */
function 档位(名: string) {
  const t = 私密档位表[名];
  if (!t) return null;
  // 好感度轴的角色必须先有关系条目，否则不显示档位，避免把 0 当成真实好感
  const 轴值 =
    t.轴 === '好感度' ? (store.data.关系[名] ? Number(store.data.关系[名].好感度 ?? 0) : undefined) : 章节序号.value;
  const i = 当前档位(名, 轴值);
  return { 轴: t.轴, 档名: t.档名, idx: i, 当前: i >= 0 ? t.档名[i] : '', 下一档: 下一档阈值(名, 轴值) };
}

const 档位列表 = computed(() =>
  Object.keys(私密档位表)
    .map(名 => ({ 名, ...档位(名)! }))
    .filter(x => x.idx >= 0),
);

/** 关系里没有、但档位表覆盖的角色，用来提示玩家这些人的档位由章节推进决定 */
const 轴为章节的人数 = computed(() => Object.values(私密档位表).filter(t => t.轴 === '章节序号').length);

// ── 房事底账 ─────────────────────────────────────────────
// 给每个「有私密档案」的角色开房事，名册以 后宫.房事 为准。
// 关系 里只装开局即在场的那几位，私密档案却覆盖全部成年女性；只按 关系 取
// 名单会把后来登场的人整批漏掉。故两处并取：后宫.房事 是权威底账，
// 关系.X.房事 若已存在则作为同步副本一并写，保证 AI 从任一处回看都读到同一份数。
// 展示时按缺省值渲染，不写状态；首次真正改动时才创建字段。
// 部位名一律取该角色自己的档案，异体部位照列，绝不套用别人的部位表。
const 房事可编辑列表 = computed(() =>
  [...new Set([...Object.keys(store.data.后宫.房事), ...Object.keys(store.data.关系)])].filter(
    名 => 部位名列表(名).length > 0,
  ),
);

/** 该角色名下已有的全部房事底账，权威份在前；一处都还没有时返回空数组 */
function 房事源(名: string) {
  const out: any[] = [];
  const a = store.data.后宫.房事[名];
  if (a) out.push(a);
  const b = store.data.关系[名]?.房事;
  if (b) out.push(b);
  return out;
}

/** 只读取值，缺省补齐，绝不创建（computed 里不能有副作用） */
function 读房事(名: string) {
  const f = 房事源(名)[0];
  return {
    侍寝次数: Number(f?.侍寝次数 ?? 0),
    最近: String(f?.最近 ?? ''),
    身体开发: Number(f?.身体开发 ?? 0),
    名器觉醒: Boolean(f?.名器觉醒),
    床评: String(f?.床评 ?? ''),
    性癖: Array.isArray(f?.性癖) ? (f!.性癖 as string[]) : [],
    部位: (f?.部位 ?? {}) as Record<string, { 熟练?: number; 备注?: string }>,
  };
}

/**
 * 写入前才创建房事字段，返回要写的全部底账（权威份在前，可能为空数组）。
 * 权威底账一定建在 后宫.房事 下，这样没进 关系 的角色也有地方记账。
 * 形状与 schema.ts 的 房事 一致。
 */
function 房事项(名: string) {
  if (部位名列表(名).length === 0) return [] as any[];
  const 空 = () => ({
    侍寝次数: 0,
    最近: '',
    身体开发: 0,
    名器觉醒: false,
    部位: {} as Record<string, { 熟练: number; 备注: string }>,
    性癖: [] as string[],
    床评: '',
  });
  const out: any[] = [];
  if (!store.data.后宫.房事[名]) (store.data.后宫.房事 as any)[名] = 空();
  out.push(store.data.后宫.房事[名]);
  const r = store.data.关系[名];
  if (r) {
    if (!r.房事) (r as any).房事 = 空();
    out.push(r.房事);
  }
  for (const f of out) {
    if (!f.部位) f.部位 = {};
    if (!Array.isArray(f.性癖)) f.性癖 = [];
  }
  return out;
}

const 房事列表 = computed(() =>
  房事可编辑列表.value.map(名 => {
    const f = 读房事(名);
    return {
      名,
      关系阶段: store.data.关系[名].关系阶段,
      侍寝次数: f.侍寝次数,
      最近: f.最近,
      身体开发: f.身体开发,
      名器觉醒: f.名器觉醒,
      床评: f.床评,
      性癖: f.性癖,
      部位: 部位名列表(名).map(名2 => ({
        名: 名2,
        熟练: Number(f.部位[名2]?.熟练 ?? 0),
        备注: String(f.部位[名2]?.备注 ?? ''),
      })),
    };
  }),
);

function 加侍寝(名: string, 增量: number) {
  const 源 = 房事项(名);
  if (!源.length) return;
  const 旧 = Number(源[0].侍寝次数 ?? 0);
  const 新 = Math.max(0, 旧 + 增量);
  if (新 === 旧) return;
  for (const f of 源) f.侍寝次数 = 新;
  // 侍寝是留痕点，写进已触发互动便于 AI 回看
  if (增量 > 0) 记互动(名, `侍寝第 ${新} 次`);
}

function 调开发(名: string, 增量: number) {
  const 源 = 房事项(名);
  if (!源.length) return;
  const 新 = Math.max(0, Math.min(100, Number(源[0].身体开发 ?? 0) + 增量));
  for (const f of 源) f.身体开发 = 新;
}

function 翻名器(名: string) {
  const 源 = 房事项(名);
  if (!源.length) return;
  const 新 = !源[0].名器觉醒;
  for (const f of 源) f.名器觉醒 = 新;
  记互动(名, 新 ? '名器显效' : '名器收回');
}

function 写房事(名: string, 键: '最近' | '床评', 值: string) {
  const 源 = 房事项(名);
  for (const f of 源) (f as any)[键] = 值;
}

/** 部位熟练：只增删该角色自己档案里有的那一处，同时留一句备注供 AI 引用 */
function 调部位(名: string, 部位: string, 增量: number) {
  if (!部位名列表(名).includes(部位)) return;
  const 源 = 房事项(名);
  if (!源.length) return;
  const 旧 = Number(源[0].部位?.[部位]?.熟练 ?? 0);
  const 新 = Math.max(0, Math.min(100, 旧 + 增量));
  if (新 === 旧) return;
  for (const f of 源) {
    const 项 = ((f.部位 as any)[部位] ??= { 熟练: 0, 备注: '' });
    项.熟练 = 新;
    if (!项.备注) 项.备注 = `${部位} 熟练 ${新}`;
    else 项.备注 = 项.备注.replace(/熟练 \d+$/, `熟练 ${新}`);
  }
}

const 癖草稿 = reactive<Record<string, string>>({});

function 加性癖(名: string) {
  const 源 = 房事项(名);
  const t = (癖草稿[名] || '').trim();
  if (!源.length || !t || 源[0].性癖.includes(t)) return;
  for (const f of 源) if (!f.性癖.includes(t)) f.性癖.push(t);
  癖草稿[名] = '';
}

function 删性癖(名: string, t: string) {
  const 源 = 房事项(名);
  for (const f of 源) {
    const i = f.性癖.indexOf(t);
    if (i >= 0) f.性癖.splice(i, 1);
  }
}

// 孕事来源两处：关系.X.孕事 与 后宫.孕事（姓名都在 key 上），后者为准，避免同一人出现两张卡
const activePreg = computed(() => {
  const map = new Map<string, Record<string, unknown>>();
  for (const [名, r] of Object.entries(store.data.关系)) {
    const p = r.孕事;
    if (p && p.状态 && p.状态 !== '无') map.set(名, { ...p, 名 });
  }
  for (const [名, p] of Object.entries(store.data.后宫.孕事)) {
    if (p.状态 !== '无') map.set(名, { ...p, 名 });
  }
  return [...map.values()].map(p => ({
    名: String(p.名),
    状态: String(p.状态 ?? ''),
    胎数: Math.max(0, Math.min(12, Number(p.胎数 ?? 0))),
    孕期: String(p.孕期 ?? ''),
    预产期: String(p.预产期 ?? ''),
    // 状态不在四档内时不高亮任何阶段，等玩家推进到确诊
    idx: 孕事阶段.indexOf(String(p.状态 ?? '')),
  }));
});

/** 该角色名下所有「活动孕事」条目，推进时一并写，保证两处来源不分叉 */
function 孕事目标(名: string) {
  const out: { 项: any }[] = [];
  const a = store.data.后宫.孕事[名];
  if (a) out.push({ 项: a });
  const b = store.data.关系[名]?.孕事;
  if (b && b.状态 && b.状态 !== '无') out.push({ 项: b });
  return out;
}

function 下一阶段(状态: string): string | null {
  const i = 孕事阶段.indexOf(状态);
  if (i < 0) return 孕事阶段[0];
  return i + 1 < 孕事阶段.length ? 孕事阶段[i + 1] : null;
}

/** 留痕：关系条目是 AI 回看玩家操作的地方 */
function 记互动(名: string, 文本: string) {
  const r = store.data.关系[名];
  if (!r) return;
  if (!Array.isArray(r.已触发互动)) (r as any).已触发互动 = [];
  r.已触发互动.push(文本);
}

function 推进孕事(名: string) {
  if (!preg_on.value) return;
  const 目标 = 孕事目标(名);
  if (!目标.length) return;
  const 旧 = String(目标[0].项.状态 ?? '');
  const 下 = 下一阶段(旧);
  if (!下) {
    分娩(名);
    return;
  }
  for (const t of 目标) t.项.状态 = 下;
  记互动(名, `孕事 ${旧 || '—'} → ${下}`);
}

function 调胎数(名: string, 增量: number) {
  if (!preg_on.value) return;
  const 目标 = 孕事目标(名);
  if (!目标.length) return;
  const 旧 = Number(目标[0].项.胎数 ?? 0);
  const 新 = Math.max(0, Math.min(12, 旧 + 增量));
  if (新 === 旧) return;
  for (const t of 目标) t.项.胎数 = 新;
  记互动(名, `胎数 ${旧} → ${新}`);
}

// 分娩登记草稿：渲染期不能改响应式状态，故用输入事件写
const 登记表 = reactive<Record<string, Record<string, string>>>({});

function 写登记(名: string, 键: string, e: Event) {
  const t = e.target as HTMLInputElement | null;
  if (!t) return;
  (登记表[名] ??= {})[键] = t.value;
}

/** record 键必须唯一，重名子嗣顺延编号 */
function 唯一键(表: Record<string, unknown>, 基: string) {
  const 前缀 = 基 || '记录';
  let 键 = 前缀;
  let i = 2;
  while (键 in 表) 键 = `${前缀}-${i++}`;
  return 键;
}

function 分娩(名: string) {
  const 登记项 = 登记表[名] ?? {};
  const 母 = store.data.后宫.成员[名];
  const 姓名 = String(登记项.姓名 || `${名}之子`).trim();
  const 键 = 唯一键(store.data.后宫.子嗣, 姓名);
  store.data.后宫.子嗣[键] = {
    母亲: 名,
    种族: 母?.种族 ?? '',
    年龄: 0,
    特征: 登记项.特征 ?? '',
    天赋: 登记项.天赋 ?? '',
    名分: 登记项.名分 ?? '',
  };
  const 胎 = Number(孕事目标(名)[0]?.项.胎数 ?? 0);
  // 世界书：分娩成功后记录从孕事移入子嗣，并清空对应孕事条目
  delete store.data.后宫.孕事[名];
  const r = store.data.关系[名];
  if (r?.孕事) {
    r.孕事.状态 = '无';
    r.孕事.胎数 = 0;
    r.孕事.孕期 = '未怀孕';
    r.孕事.预产期 = '无';
  }
  delete 登记表[名];
  记互动(名, `分娩登记：${键}（${胎}胎）`);
}

// 正向主线到妻子为止；疏离是旁支，从疏离或未知档位推进一律回到初识重新走
function 下一成员阶段(当前: string): 阶段 | null {
  const i = 正向阶段.indexOf(String(当前) as (typeof 正向阶段)[number]);
  if (i < 0) return 阶段序[0];
  return i + 1 < 正向阶段.length ? 正向阶段[i + 1] : null;
}

function 推进成员(名: string) {
  const m = store.data.后宫.成员[名];
  if (!m) return;
  const 旧 = String(m.关系阶段 ?? '');
  const 新 = 下一成员阶段(旧);
  if (!新) return;
  m.关系阶段 = 新;
  const r = store.data.关系[名];
  if (r) {
    r.关系阶段 = 新;
    记互动(名, `后宫关系阶段 ${旧 || '—'} → ${新}`);
  }
}

function 可增(名: string, 键: 数值键) {
  return Number(store.data.关系[名]?.[键] ?? 0) < 范围[键][1];
}

function 可减(名: string, 键: 数值键) {
  return Number(store.data.关系[名]?.[键] ?? 0) > 范围[键][0];
}

function 微调(名: string, 键: 数值键, 增量: number) {
  const r = store.data.关系[名];
  if (!r) return;
  const 旧 = Number(r[键] ?? 0);
  const 新 = Math.max(范围[键][0], Math.min(范围[键][1], 旧 + 增量));
  if (新 === 旧) return;
  r[键] = 新;
  记互动(名, `${键} ${增量 > 0 ? '+' : ''}${增量} → ${新}`);
}

/** 好感度与信任度是双向值，条宽按 −100~100 映射到 0~100 */
function 条宽(键: 数值键, 值: unknown) {
  const n = Number(值 ?? 0);
  return `${键 === '亲密' ? Math.max(0, Math.min(100, n)) : Math.max(0, Math.min(100, (n + 100) / 2))}%`;
}

const 记录草稿 = reactive({ 对象: '', 日期: '', 场景: '', 摘要: '' });

function 写亲密记录() {
  const 对象 = 记录草稿.对象.trim();
  const 摘要 = 记录草稿.摘要.trim();
  if (!对象 || !摘要) return;
  const 日期 = 记录草稿.日期.trim() || 世界日期.value;
  const 键 = 唯一键(store.data.后宫.亲密记录, `${对象}-${日期}`);
  store.data.后宫.亲密记录[键] = { 对象, 日期, 场景: 记录草稿.场景.trim(), 摘要 };
  记互动(对象, `亲密记录：${摘要}`);
  记录草稿.场景 = '';
  记录草稿.摘要 = '';
}

function 删记录(键: string) {
  delete store.data.后宫.亲密记录[键];
}
</script>

<style lang="scss" scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 7px;
}

.c {
  border: 1px solid var(--sb-line);
  border-left: 2px solid var(--sb-bond);
  background: var(--sb-bg);
  padding: 6px 7px;
}

.chead {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 5px;
}

.stage {
  display: flex;
  gap: 3px;
  margin-bottom: 5px;
}

.st {
  flex: 1;
  text-align: center;
  font-size: 10px;
  padding: 2px 0;
  border: 1px solid var(--sb-line);
  color: var(--sb-dim);
}

.st.on {
  border-color: var(--sb-bond);
  color: var(--sb-bond);
}

.st.now {
  background: rgba(201, 111, 138, 0.16);
}

.kv {
  display: flex;
  gap: 12px;
  font-size: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.kv .sb-dim {
  margin-right: 5px;
}

.tnum {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ctl {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.reg {
  margin-top: 5px;
  border-top: 1px dashed var(--sb-line);
  padding-top: 5px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  font-size: 11px;
}

.reg .sb-dim {
  grid-column: 1 / -1;
}

.tunes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 7px;
}

.tune {
  border: 1px solid var(--sb-line);
  border-left: 2px solid var(--sb-bond);
  background: var(--sb-bg);
  padding: 5px 7px;
}

.tiers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 7px;
}

.tier {
  border: 1px solid var(--sb-line);
  border-left: 2px solid var(--sb-void);
  background: var(--sb-bg);
  padding: 5px 7px;
}

.steps {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.step {
  flex: 1 1 auto;
  min-width: 52px;
  padding: 2px 5px;
  border: 1px solid var(--sb-line);
  background: var(--sb-panel);
  color: var(--sb-dim);
  font-size: 11px;
  text-align: center;
  white-space: nowrap;
}

.step.on {
  border-color: var(--sb-void);
  color: var(--sb-text);
}

.step.cur {
  background: var(--sb-void);
  border-color: var(--sb-void);
  color: var(--sb-bg);
  font-weight: 600;
}

.thead {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
}

.line {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
}

.lbl {
  flex: none;
  width: 30px;
  color: var(--sb-dim);
  font-size: 11px;
}

.line .sb-bar {
  flex: 1;
}

.v {
  flex: none;
  width: 30px;
  text-align: right;
  font-size: 11px;
}

.mini {
  padding: 1px 6px;
  font-size: 11px;
  line-height: 1.3;
}

.form {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 7px;
}

.sb-in {
  background: #0d0b08;
  border: 1px solid var(--sb-line);
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 12px;
  padding: 3px 6px;
  min-width: 96px;
  flex: 1;
}

.sb-in.wide {
  flex: 2 1 200px;
}

.hint,
.rules {
  margin-top: 7px;
  font-size: 11px;
  border-top: 1px dashed var(--sb-line);
  padding-top: 5px;
}

// ── 房事底账 ──
.beds {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 7px;
}

.bed {
  border: 1px solid var(--sb-line);
  border-left: 2px solid var(--sb-life);
  background: var(--sb-bg);
  padding: 5px 7px;
}

.bed .thead b {
  color: var(--sb-life);
}

.parts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 3px;
  margin: 4px 0;
}

.part {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pname {
  flex: none;
  width: 62px;
  overflow: hidden;
  color: var(--sb-dim);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.part .sb-bar {
  flex: 1;
}

.part .sb-num {
  flex: none;
  width: 24px;
  color: var(--sb-dim);
  font-size: 11px;
  text-align: right;
}

.删癖 {
  margin-left: 3px;
  cursor: pointer;
  opacity: 0.7;
}

.删癖:hover {
  opacity: 1;
  color: var(--sb-life);
}
</style>
