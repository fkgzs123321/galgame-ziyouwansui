// 《自由万岁》MVU 变量结构
// 与 创作规划.yaml 的 mvu.variables 一一对应，供 EJS 门控（世界.剧情阶段等）、分支结算（觉醒度/暴露度）与状态栏读取；
// 运行时由 forge 注入全局 z（Zod 4）与 _（lodash），禁止 import。

export const Schema = z
  .object({
    世界: z
      .object({
        当前日期: z.string().describe('格式：YYYY年MM月DD日').prefault('2026年06月20日'),
        当前场景: z.string().describe('地点·时段，如：陆家别墅·宴会厅·夜').prefault('陆家别墅·宴会厅·夜'),
        剧情阶段: z.enum(['阶段一', '阶段二', '阶段三', '阶段四', '阶段五', '阶段六']).prefault('阶段一'),
        阶段节拍: z
          .coerce.number()
          .describe('当前阶段已进行的剧情节拍数，进入新阶段时归零；作为锚点触发的节奏门槛')
          .transform(v => Math.max(v, 0))
          .prefault(0),
        已触发锚点: z.array(z.string()).prefault([]),
        最近判定: z
          .object({
            说明: z.string().prefault(''),
            骰值: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
            目标: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(50),
            结果: z.enum(['无需判定', '大成功', '成功', '失败', '大失败']).prefault('无需判定'),
          })
          .prefault({ 说明: '', 骰值: 0, 目标: 50, 结果: '无需判定' }),
        // 判定记录：仅保留最近 5 次，更早的由 transform 自动截断
        判定记录: z
          .array(
            z.object({
              说明: z.string().prefault(''),
              骰值: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
              目标: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(50),
              结果: z.enum(['无需判定', '大成功', '成功', '失败', '大失败']).prefault('无需判定'),
            }),
          )
          .transform(arr => arr.slice(-5))
          .prefault([]),
        // 幕后动态：每轮私下推进的各角色幕后事件（0~2条），仅经认知渠道浮现给玩家；保留最近 6 条
        幕后动态: z
          .array(z.string().prefault(''))
          .transform(arr => arr.slice(-6))
          .prefault([]),
      })
      .prefault({}),

    玩家: z
      .object({
        身份: z.string().prefault(''),
        资金: z.coerce.number().describe('单位：元').transform(v => Math.max(v, 0)).prefault(8000),
      })
      .prefault({}),

    沈知意: z
      .object({
        对玩家好感: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(25),
        对周燃态度: z.enum(['真爱', '动摇', '失望', '名存实亡', '决裂']).prefault('真爱'),
        对陆司砚态度: z.enum(['视为兄长', '怨恨', '复杂', '愧疚']).prefault('视为兄长'),
        转正状态: z.enum(['实习生', '已转正', '被淘汰']).prefault('实习生'),
        // 七项庇护资源：true=已被陆家收回；锚点「资源收回」后逐项置 true 且不可逆
        七项资源: z
          .object({
            订婚珠宝: z.boolean().prefault(false),
            黑卡: z.boolean().prefault(false),
            专车: z.boolean().prefault(false),
            门禁权限: z.boolean().prefault(false),
            合作项目: z.boolean().prefault(false),
            信用担保: z.boolean().prefault(false),
            病房续费: z.boolean().prefault(false),
          })
          .describe('七项庇护资源，true=已被陆家收回')
          .prefault({}),
        债务金额: z.coerce.number().prefault(0),
        母亲病情: z.enum(['长期治疗', '转入普通病房', '病危抢救', '病情反复', '脱离危险']).prefault('长期治疗'),
        陆家态度: z.enum(['视为己出', '失望', '心碎拒见']).prefault('视为己出'),
        觉醒度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
      })
      .prefault({}),

    陆司砚: z
      .object({
        对玩家好感: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(25),
        对沈知意态度: z.enum(['兄长式照顾', '失望克制', '彻底放手']).prefault('兄长式照顾'),
      })
      .prefault({}),

    林清禾: z
      .object({
        对玩家好感: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(25),
        对沈知意态度: z.enum(['隐忍', '划清界限', '平和', '怜悯']).prefault('隐忍'),
        职业阶段: z.enum(['新人', '转正', '骨干']).prefault('新人'),
        月收入: z.coerce.number().prefault(5000),
        与陆司砚感情: z.enum(['初识', '相识', '欣赏', '暧昧', '确定']).prefault('初识'),
      })
      .prefault({}),

    周燃: z
      .object({
        对玩家好感: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(25),
        暴露度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
        修车店经营: z.enum(['惨淡', '维持', '起色']).prefault('惨淡'),
      })
      .prefault({}),

    赵媛: z
      .object({
        对玩家好感: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(25),
        站队立场: z.enum(['跟随沈知意', '观望', '站队林清禾', '独立']).prefault('跟随沈知意'),
      })
      .prefault({}),

    温惠茹: z
      .object({
        对玩家好感: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(25),
        婚姻心境: z.enum(['安稳', '寂寥', '重温']).prefault('安稳'),
      })
      .prefault({}),

    苏晚晴: z
      .object({
        对玩家好感: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(25),
      })
      .prefault({}),
  })
  .prefault({});

export type Schema = z.output<typeof Schema>;
