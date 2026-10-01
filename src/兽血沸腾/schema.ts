// 兽血沸腾 MVU 变量结构
// 与 世界书/变量/变量更新规则.yaml 一一对应；集合一律用对象而非数组，
// 便于 AI 以 JSON Patch 按名字定位（如 /战斗/我方/巨狼/生命）。

const 文本 = z.string().prefault('');

const 数 = (min: number, max: number, 默认: number = min) =>
  z.coerce
    .number()
    .prefault(默认)
    .transform(v => _.clamp(v, min, max));

const 整数 = z.coerce
  .number()
  .prefault(0)
  .transform(v => Math.trunc(v));

const 开关 = z
  .union([z.boolean(), z.string()])
  .prefault(true)
  .transform(v => (typeof v === 'boolean' ? v : !['false', '0', '否', 'no', ''].includes(v.trim().toLowerCase())));

const 集合 = <T extends z.ZodTypeAny>(值: T) => z.record(z.string(), 值).prefault({});

const 数值表 = <const K extends readonly [string, ...string[]]>(键: K, 默认: number = 0) =>
  z.record(z.enum(键), z.coerce.number().prefault(默认)).prefault({}) as z.ZodType<
    Record<K[number], number>,
    Record<K[number], number>
  >;

const 开关表 = z.record(z.enum(['孕事系统', '战斗自动结算', '领地自动产出', '作者插话']), 开关).prefault({});

const 生命值 = z
  .object({
    当前: 数(0, 99999, 100),
    上限: 数(1, 99999, 100),
  })
  .prefault({});

const 孕事 = z
  .object({
    状态: 文本.prefault('无'),
    胎数: 数(0, 12, 0),
    孕期: 文本.prefault('未怀孕'),
    预产期: 文本.prefault('无'),
  })
  .prefault({});

// 房事：把 私密档案 里逐部位写定的身子底账接成可推进的状态。
// 「部位」的键分两类：原装十五处（奶子/奶头/乳晕/逼/阴唇/阴蒂/屁眼/腰/臀/腿/足/手/口/腋/发），
// 以及该角色独有的异体部位（珊瑚胶体、石化壳、龙鳞、九首断口……），故为自由 record。
const 房事 = z
  .object({
    侍寝次数: 数(0, 9999, 0),
    最近: 文本.prefault('未记载'),
    身体开发: 数(0, 100, 0),
    名器觉醒: 开关.prefault(false),
    部位: 集合(z.object({ 熟练: 数(0, 100, 0), 备注: 文本 }).prefault({})),
    性癖: z.array(z.string()).prefault([]),
    床评: 文本,
  })
  .prefault({});

const 关系项 = z
  .object({
    好感度: 数(-100, 100, 0),
    信任度: 数(-100, 100, 0),
    关系阶段: z.enum(['初识', '同伴', '相知', '相爱', '妻子', '疏离']).prefault('初识'),
    亲密: 数(0, 100, 0),
    印象: 文本.prefault('尚未相识'),
    已触发互动: z.array(z.string()).prefault([]),
    孕事,
    房事,
  })
  .prefault({});

// 层级 记录阕次或战歌类型（如 第三阕 / 交响 / 单控 / 独奏 / 神曲），故为文本
const 战歌节点 = z
  .object({
    解锁: 开关.prefault(false),
    熟练度: 数(0, 100, 0),
    层级: 文本,
  })
  .prefault({});

// 异体原成长线以「层」计量（龙力系三层、金刚伏魔之力四层）
const 成长节点 = z.object({ 解锁: 开关.prefault(false), 层级: 数(0, 99, 0) }).prefault({});

const 兵种节点 = z
  .object({
    解锁: 开关.prefault(false),
    等级: 数(0, 99, 0),
    训练度: 数(0, 100, 0),
  })
  .prefault({});

const 科技节点 = z.object({ 解锁: 开关.prefault(false), 等级: 数(0, 99, 0) }).prefault({});

const 自定义节点 = z
  .object({
    说明: 文本,
    消耗: 文本,
    状态: z.enum(['未解锁', '已解锁', '成长中']).prefault('未解锁'),
  })
  .prefault({});

const 战斗单位 = z
  .object({
    兵种: 文本,
    生命: 数(0, 999999, 0),
    状态: 文本,
    站位: 文本,
  })
  .prefault({});

const 战报项 = z
  .object({
    摘要: 文本,
    我方损失: 文本,
    敌方损失: 文本,
  })
  .prefault({});

const 魔宠项 = z
  .object({
    种类: 文本,
    忠诚: 数(0, 100, 0),
    阶位: 文本,
    技能: 文本,
    状态: 文本,
    契约: 文本.prefault('未签'),
  })
  .prefault({});

export const Schema = z.object({
  世界: z
    .object({
      日期: 文本.prefault('140/05/12'),
      时段: z.enum(['凌晨', '清晨', '上午', '正午', '下午', '黄昏', '夜晚', '深夜']).prefault('上午'),
      当前区域: 文本,
      当前场景: 文本,
      天气: z.enum(['晴', '阴', '雨', '雪', '雾', '沙暴', '风暴']).prefault('晴'),
      近期事务: 集合(
        z
          .object({
            类型: z.enum(['主线', '支线', '领地', '私人']).prefault('主线'),
            说明: 文本,
            状态: z.enum(['未开始', '进行中', '已完成', '已失败']).prefault('进行中'),
          })
          .prefault({}),
      ),
    })
    .prefault({}),

  剧情: z
    .object({
      当前卷: z
        .enum(['荒岛篇', '胸罩岛篇', '海上篇', '多瑙大荒原篇', '博格村与领地初建', '翡冷翠领主期', '比蒙王国纵横'])
        .prefault('荒岛篇'),
      章节序号: 数(0, 763, 0),
      章节节点: 文本,
      主线进度: 数(0, 100, 0),
      已触发事件: 集合(z.object({ 卷: 文本, 章节: 文本, 结果: 文本 }).prefault({})),
      分歧记录: 集合(z.object({ 卷: 文本, 与原作差异: 文本, 后果: 文本 }).prefault({})),
      名场面: 集合(z.object({ 卷: 文本, 章节: 文本, 内容: 文本 }).prefault({})),
    })
    .prefault({}),

  主角: z
    .object({
      名称: 文本.prefault(''),
      身份: 文本,
      阶位: z
        .enum(['无', '风语祭祀', '灵魂祭祀', '战争祭祀', '权杖祭祀', '维安大萨满', '十二主祭', '红衣大祭司'])
        .prefault('无'),
      阵营声望: 集合(数(-100, 100, 0)),
      生命: 生命值,
      歌力: 生命值,
      体力: 数(0, 100, 60),
      属性: z
        .object({
          力量: 数(0, 999, 0),
          敏捷: 数(0, 999, 0),
          体质: 数(0, 999, 0),
          感知: 数(0, 999, 0),
          魅力: 数(0, 999, 0),
          智慧: 数(0, 999, 0),
        })
        .prefault({}),
      状态: 集合(
        z
          .object({
            类型: z.enum(['增益', '减益', '特殊']).prefault('特殊'),
            来源: 文本,
            剩余时限: 文本,
          })
          .prefault({}),
      ),
      诅咒: z
        .object({
          血之祭奠: 开关.prefault(false),
          说明: 文本,
        })
        .prefault({}),
      战歌: 集合(z.object({ 层级: 文本, 熟练度: 数(0, 100, 0) }).prefault({})),
      自创战歌: 集合(z.object({ 歌词: 文本, 效果: 文本, 熟练度: 数(0, 100, 0) }).prefault({})),
      异体原: z
        .object({
          龙力系: 数(0, 100, 0),
          花系: 数(0, 100, 0),
          金刚伏魔之力: 数(0, 100, 0),
          秘银断臂: 开关.prefault(false),
        })
        .prefault({}),
      装备: 集合(z.object({ 名称: 文本, 品阶: 文本, 状态: 文本 }).prefault({})),
      物品栏: 集合(z.object({ 数量: 数(0, 99999, 0), 说明: 文本 }).prefault({})),
      淫乱度: 数(0, 100, 0),
      精力: 数(0, 100, 100),
    })
    .prefault({}),

  技能树: z
    .object({
      战歌树: 集合(战歌节点),
      异体原: 集合(成长节点),
      兵种树: 集合(兵种节点),
      领地科技树: 集合(科技节点),
      自定义: 集合(自定义节点),
    })
    .prefault({}),

  战斗: z
    .object({
      进行中: 开关.prefault(false),
      回合: 整数,
      阶段: z.enum(['未开始', '布阵', '交锋', '鏖战', '追击', '撤退', '结算']).prefault('未开始'),
      环境: z
        .object({
          地形: 文本,
          天气: 文本,
          结界: 集合(z.object({ 施放者: 文本, 范围: 文本, 效果: 文本 }).prefault({})),
        })
        .prefault({}),
      我方: 集合(战斗单位),
      敌方: 集合(战斗单位),
      战歌加持: 集合(z.object({ 施法者: 文本, 剩余时限: 文本 }).prefault({})),
      战报: 集合(战报项),
    })
    .prefault({}),

  领地: z
    .object({
      名称: 文本.prefault('未受封'),
      等级: 数(1, 10, 1),
      声望: 数(0, 100, 0),
      人口: 数(0, 99999999, 0),
      民心: 数(0, 100, 50),
      治安: 数(0, 100, 50),
      资源: 数值表(['金币', '粮食', '木材', '石料', '铁', '精金', '魔晶']),
      建筑: 集合(z.object({ 等级: 数(0, 99, 0), 状态: 文本 }).prefault({})),
      兵力: 集合(z.object({ 数量: 数(0, 999999, 0), 训练度: 数(0, 100, 0) }).prefault({})),
      附庸族: 集合(
        z
          .object({
            人数: 数(0, 99999999, 0),
            代表: 文本,
            关系: z.enum(['融洽', '稳定', '紧张', '对立']).prefault('稳定'),
          })
          .prefault({}),
      ),
    })
    .prefault({}),

  魔宠: 集合(魔宠项),

  关系: 集合(关系项),

  后宫: z
    .object({
      成员: 集合(
        z
          .object({
            种族: 文本,
            身份: 文本,
            关系阶段: 文本,
            加入章节: 文本,
          })
          .prefault({}),
      ),
      子嗣: 集合(
        z
          .object({
            母亲: 文本,
            种族: 文本,
            年龄: 数(0, 9999, 0),
            特征: 文本,
            天赋: 文本,
            名分: 文本,
          })
          .prefault({}),
      ),
      孕事: 集合(
        z
          .object({
            状态: 文本.prefault('进行中'),
            胎数: 数(0, 12, 1),
            孕期: 文本,
            预产期: 文本,
            受孕章节: 文本,
          })
          .prefault({}),
      ),
      // 房事在这里再挂一份名册索引：关系 只装开局即在场的那几位，
      // 而私密档案覆盖全部成年女性，故以名册为准，关系 里的那一份退为同步副本。
      房事: 集合(房事),
      亲密记录: 集合(z.object({ 对象: 文本, 日期: 文本, 场景: 文本, 摘要: 文本 }).prefault({})),
    })
    .prefault({}),

  系统: z
    .object({
      难度: z.enum(['轻松', '标准', '硬核']).prefault('标准'),
      规则开关: 开关表,
      玩家自定义: z.record(z.string(), 文本).prefault({}),
    })
    .prefault({}),
});

export type Schema = z.output<typeof Schema>;
