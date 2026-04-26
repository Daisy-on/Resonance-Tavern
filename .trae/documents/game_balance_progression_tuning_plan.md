# 游戏流程与平衡调优计划

## Summary

本次调优聚焦三个目标：

1. 提高生存压力，解决当前“资源太充裕、很容易活下去”的问题。
2. 重做前中后期的难度梯度，让订单波形、资源回报、失败惩罚与解锁节奏更加匹配。
3. 降低角色档案解锁门槛，仅调整档案阈值，不改变对白层级区间。

本次计划遵循两个已确认的方向：

- 前期的高难基础波形不完全删除，而是“保留随机但显著降权”。
- 难度曲线采用“前期少量加压，中期重度加压，后期重度加压”。

## Current State Analysis

### 1. 资源与收益现状

- [game-state.ts](file:///d:/Homework_vs/game-pr/src/game/game-state.ts) 当前初始资源为：`money=200`、`power=30`、`rating=50`。
- 同文件中的 `balanceConfig` 当前为：`baseOrderPrice=18`，奖励表为 `20 / 12 / 6 / 0 / -4`。
- [orders.ts](file:///d:/Homework_vs/game-pr/src/content/orders.ts) 当前订单基础报酬为 `30 + difficulty * 15`，即难度 1/2/3 的基础收入分别为 `45 / 60 / 75`。
- [economy-system.ts](file:///d:/Homework_vs/game-pr/src/systems/economy/economy-system.ts) 当前房租梯度为 `20 / 45 / 70`，后期压力存在，但前中期现金流过宽。

### 2. 难度梯度现状

- [orders.ts](file:///d:/Homework_vs/game-pr/src/content/orders.ts) 当前 Day 1-2 就会在 `sine / triangle / square / sawtooth` 四种基础波形中完全等概率随机。
- [spirits.ts](file:///d:/Homework_vs/game-pr/src/content/spirits.ts) 中 `sawtooth` 对应的基酒是 `rum`。
- [unlock-system.ts](file:///d:/Homework_vs/game-pr/src/game/unlock-system.ts) 中 `rum` 要到 Day 4 才解锁，因此前两天确实会出现“订单要求与玩家当前可用工具不匹配”的情况。
- [orders.ts](file:///d:/Homework_vs/game-pr/src/content/orders.ts) 当前高级参数梯度偏粗：
  - Day 1-2：仅基础波形
  - Day 3-7：只增加一种高级维度
  - Day 8+：直接进入 `edge + noise + harmonics + decay` 的复合难度
- [economy-system.ts](file:///d:/Homework_vs/game-pr/src/systems/economy/economy-system.ts) 当前评分惩罚只在 Day 8+ 略微加重，奖励随天数的放大幅度不足。

### 3. 档案解锁现状

- [guests.ts](file:///d:/Homework_vs/game-pr/src/content/guests.ts) 当前所有角色档案阈值统一为 `20 / 50 / 80`。
- [hud-renderer.ts](file:///d:/Homework_vs/game-pr/src/ui/hud-renderer.ts) 的档案显示逻辑直接使用 `entry.threshold` 判定，因此阈值只需改数据，不需要额外改 UI 逻辑。
- [npc-system.ts](file:///d:/Homework_vs/game-pr/src/systems/npc/npc-system.ts) 当前好感增长为：
  - `>=95`：`+5`
  - `>=80`：`+2`
  - `>=60`：`+1`
  - `<40`：`-2`
- 本次已确认：只降低档案阈值，不同步调整 `neutral / friendly / trusted / resonant` 的对白分段。

## Proposed Changes

### 1. 调整初始资源与基础奖励

**目标文件：** [game-state.ts](file:///d:/Homework_vs/game-pr/src/game/game-state.ts)

#### 修改内容

- 将初始资源从：
  - `money: 200 -> 150`
  - `power: 30 -> 24`
  - `rating: 50` 保持不变
- 将默认奖励表从：
  - `perfect: 20`
  - `high: 12`
  - `normal: 6`
  - `low: 0`
  - `fail: -4`
- 调整为较紧的默认表：
  - `perfect: 14`
  - `high: 8`
  - `normal: 3`
  - `low: -2`
  - `fail: -8`
- `baseOrderPrice` 从 `18 -> 12`，作为缺省回退值同步压低。

#### 原因

- 前期容错仍保留，但不能再允许玩家依靠宽松起始资金轻松跨过 Day 1-3。
- 保持评分初值不变，可以避免酒吧一开局就陷入“数值上看很破败”的挫败感。

### 2. 重做订单报酬曲线与日结压力

**目标文件：** [orders.ts](file:///d:/Homework_vs/game-pr/src/content/orders.ts)、[economy-system.ts](file:///d:/Homework_vs/game-pr/src/systems/economy/economy-system.ts)

#### 修改内容

- 将 [orders.ts](file:///d:/Homework_vs/game-pr/src/content/orders.ts) 中 `rewardBase` 从 `30 + difficulty * 15` 改为：
  - `difficulty 1 -> 30`
  - `difficulty 2 -> 38`
  - `difficulty 3 -> 50`
  - 实现方式可直接改为 `20 + difficulty * 10`
- 将 [economy-system.ts](file:///d:/Homework_vs/game-pr/src/systems/economy/economy-system.ts) 的 `getScoreBonus()` 改造成“按天数分段”的奖励/惩罚表，而不是只读一套固定表：
  - Day 1-3：
    - `>=95: +12`
    - `>=80: +6`
    - `>=60: +2`
    - `>=40: -2`
    - `<40: -8`
  - Day 4-7：
    - `>=95: +18`
    - `>=80: +10`
    - `>=60: +2`
    - `>=40: -6`
    - `<40: -14`
  - Day 8+：
    - `>=95: +26`
    - `>=80: +14`
    - `>=60: +0`
    - `>=40: -10`
    - `<40: -20`
- 将房租梯度从 `20 / 45 / 70` 调整为：
  - Day 1-3：`25`
  - Day 4-7：`55`
  - Day 8+：`85`

#### 原因

- 前期只做少量加压：基础报酬降低，但不是“开局即断粮”。
- 中后期加大结果分层：高匹配值得更高回报，低匹配必须付出更重代价。
- 房租同步提高，保证经营系统不会被“高天数但仍低压力”的情况稀释。

### 3. 重做订单难度梯度与前期波形权重

**目标文件：** [orders.ts](file:///d:/Homework_vs/game-pr/src/content/orders.ts)

#### 修改内容

- 将基础波形从当前“全等概率随机”改为“按天数分权重随机”：
  - Day 1-2：`sine 35% / triangle 30% / square 30% / sawtooth 5%`
  - Day 3：`sine 30% / triangle 25% / square 25% / sawtooth 20%`
  - Day 4+：恢复近似均衡随机
- 保留前期出现 `sawtooth` 的可能性，但将其改成明显低权重，符合“保留随机但降权”的已确认方向。
- 将高级参数节奏从“Day 3-7 一刀切”细化为四段：
  - Day 1-2：
    - 仅基础波形
    - `edgeSharpness=0`
    - `noiseLevel=0`
    - `harmonics=0`
    - `decay=50`
  - Day 3-4：
    - 单一高级维度
    - `edgeSharpness` 或 `noiseLevel` 范围改为 `20-45`
  - Day 5-7：
    - 单一高级维度，但范围扩大到 `35-70`
    - 允许小幅 `decay` 波动（例如 `40-60`）
  - Day 8+：
    - 保留复合波形
    - `edgeSharpness=25-65`
    - `noiseLevel=25-65`
    - `harmonics=30-80`
    - `decay=20-80`
- `difficulty` 仍保持 `1 / 2 / 3` 三档，但 Day 3-4 与 Day 5-7 在同为 `difficulty=2` 的前提下，参数范围明显不同。

#### 原因

- 解决当前 Day 1-2 “出现玩家几乎无解的基础波形”的问题。
- 让中期难度成长更加连续，而不是 Day 3 一下跳、Day 8 再一下跳。
- 保持随机性与酒吧经营的不可预测感，同时避免不公平感。

### 4. 调整评分资源后果，使中后期更重压

**目标文件：** [economy-system.ts](file:///d:/Homework_vs/game-pr/src/systems/economy/economy-system.ts)

#### 修改内容

- 将 `applyOrderRating()` 改为按天数分段的评分变化：
  - Day 1-3：
    - `>=95: +4`
    - `>=80: +2`
    - `>=60: 0`
    - `>=40: -1`
    - `<40: -4`
  - Day 4-7：
    - `>=95: +5`
    - `>=80: +2`
    - `>=60: -1`
    - `>=40: -4`
    - `<40: -7`
  - Day 8+：
    - `>=95: +6`
    - `>=80: +3`
    - `>=60: -2`
    - `>=40: -6`
    - `<40: -9`

#### 原因

- 中后期要放大“高分值得追、低分真的危险”这一经营压力。
- 将 `60-79` 从“后期无损过关”改成“后期也会付出代价”，逼迫玩家追求更高稳定度。

### 5. 降低角色档案阈值

**目标文件：** [guests.ts](file:///d:/Homework_vs/game-pr/src/content/guests.ts)

#### 修改内容

- 将所有角色的 `archives` 阈值统一从：
  - `20 / 50 / 80`
- 调整为：
  - `10 / 20 / 30`

#### 范围说明

- 仅修改 `archives[].threshold`
- 不修改：
  - `dialogues.affinityLevels` 的分段描述
  - `updateGuestAffinity()` 的增减规则
  - 档案 UI 渲染逻辑

#### 原因

- 当前档案推进明显慢于角色对话和单局节奏，导致玩家很难形成“持续解锁”的正反馈。
- UI 已经是数据驱动，阈值只要改数据即可全局生效，改动收益高、风险低。

### 6. 保持兼容与验证边界

**目标文件：** [hud-renderer.ts](file:///d:/Homework_vs/game-pr/src/ui/hud-renderer.ts)

#### 修改内容

- 逻辑上不需要修改档案解锁实现，只需要确认：
  - 档案室继续使用 `affinity >= threshold`
  - 锁定提示文案继续读取新的阈值数字

#### 原因

- 当前 UI 已经正确读取档案阈值数据，本次改动应尽量集中在数值和内容层，不增加无关 UI 风险。

## Assumptions & Decisions

- 前期高难基础波形不做彻底禁用，而是按你的要求改成“保留随机但降权”。
- 整体难度不做“一刀切变难”，而是：
  - 前期小幅加压
  - 中期重度加压
  - 后期重度加压
- 档案阈值只影响档案解锁，不联动对白层级。
- 评分算法 [wave-match.ts](file:///d:/Homework_vs/game-pr/src/systems/wave/wave-match.ts) 本次不改公式，只改“结果后果”和“订单生成”，避免把玩法手感与数值平衡同时搅动。
- `rum` 的解锁天数本次不提前，仍保留在 Day 4；问题通过订单波形权重来修正。

## Verification Steps

1. 运行 `npm run typecheck`，确认平衡调整未引入类型错误。
2. 手动验证 Day 1-2 连续开局若干次，确认 `sawtooth` 仍可能出现但明显少于其他三种基础波形。
3. 验证 Day 3-7 的订单复杂度能明显感觉到“前半段渐进、后半段更难”，而不是整段完全同强度。
4. 验证 Day 1-3 玩家不再能轻松积累过多现金，但也不会在正常发挥下两三单直接暴毙。
5. 验证 Day 5+ 的低匹配惩罚和高匹配收益差距显著拉开。
6. 打开档案室，确认所有角色的锁定提示已变为 `10 / 20 / 30`，并且达到对应好感时正常解锁。
