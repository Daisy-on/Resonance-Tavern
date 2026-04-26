# 每日客人数梯度调整计划

## Summary

目标是把每日客人数从固定值改为分段值：

- 第 1-7 天：每天 4 位客人
- 第 8 天起：每天 5 位客人

本次改动只涉及“每日订单上限（`maxOrdersPerDay`）的计算与同步”，不改订单内容、经济结算公式、事件系统或客人池随机逻辑。

## Current State Analysis

- 当前状态默认值在 [game-state.ts](file:///d:/Homework_vs/game-pr/src/game/game-state.ts)：
  - `createDefaultGameState()` 将 `maxOrdersPerDay` 固定为 `5`。
- 主循环在 [game-loop.ts](file:///d:/Homework_vs/game-pr/src/game/game-loop.ts)：
  - 使用 `ordersCompletedToday >= maxOrdersPerDay` 判断是否进入日结。
  - `next_day` 只做 `day += 1`、重置当日计数和事件，不会按新天数重算 `maxOrdersPerDay`。
- HUD 展示在 [hud-renderer.ts](file:///d:/Homework_vs/game-pr/src/ui/hud-renderer.ts)：
  - 文案显示 `订单: ordersCompletedToday/maxOrdersPerDay`，天然支持动态上限。
- 存档合并在 [save-system.ts](file:///d:/Homework_vs/game-pr/src/systems/save/save-system.ts)：
  - 采用 `defaultState + parsed` 合并，旧存档会保留其 `maxOrdersPerDay`，不会自动套用新规则。

## Proposed Changes

### 1. 增加“按天数计算客人数上限”的统一函数

**文件：** [game-state.ts](file:///d:/Homework_vs/game-pr/src/game/game-state.ts)

- 新增函数（示例命名）：
  - `getMaxOrdersPerDay(day: number): number`
- 规则固定为：
  - `day <= 7` 返回 `4`
  - `day >= 8` 返回 `5`
- `createDefaultGameState()` 中 `maxOrdersPerDay` 不再写死 `5`，改为 `getMaxOrdersPerDay(1)`，确保新开局正确为 4。

**为什么这么改**
- 让规则来源单一，后续再调梯度时只改一个函数，避免硬编码分散在不同模块。

### 2. 切天时同步刷新每日客人数上限

**文件：** [game-loop.ts](file:///d:/Homework_vs/game-pr/src/game/game-loop.ts)

- 在 `next_day` 分支里，`day += 1` 后立即同步：
  - `currentState.maxOrdersPerDay = getMaxOrdersPerDay(currentState.day)`
- 保持现有顺序：解锁、清零当日计数、重置流水、抽取事件不变。

**为什么这么改**
- 确保 Day 8 开始当天就自动从 4 切到 5，不需要重开或手动刷新。

### 3. 处理旧存档兼容（进入循环时按当前天数纠正）

**文件：** [game-loop.ts](file:///d:/Homework_vs/game-pr/src/game/game-loop.ts)

- 在 `createGameLoop()` 初始化 `currentState` 后，增加一次兜底同步：
  - `currentState.maxOrdersPerDay = getMaxOrdersPerDay(currentState.day)`

**为什么这么改**
- 旧存档里可能仍是固定 `5`，初始化时兜底可避免 Day 1-7 仍显示/执行 5 单上限。

### 4. 存档加载兼容（加载即纠正）

**文件：** [save-system.ts](file:///d:/Homework_vs/game-pr/src/systems/save/save-system.ts)

- 在 `loadGameState()` 合并出 `merged` 后，按 `merged.day` 重新设置：
  - `merged.maxOrdersPerDay = getMaxOrdersPerDay(merged.day)`
- 需要在该文件新增对 `getMaxOrdersPerDay` 的导入。

**为什么这么改**
- 把规则前置到加载阶段，可保证 HUD、逻辑、存档状态一致，减少“加载后第一帧显示旧值”的风险。

## Assumptions & Decisions

- “每天出现的客人”定义为每日可完成订单上限（`maxOrdersPerDay`），不是同时出现数量。
- 不改 `ordersCompletedToday` 计数方式，不改日结入口条件，仅改上限数值来源。
- 不新增配置文件或运行时参数，先采用代码内固定规则（1-7 天 4 位，8 天起 5 位）。
- HUD 不需要额外代码调整，继续读取 `maxOrdersPerDay` 即可自动显示正确进度。

## Verification Steps

1. 类型检查
- 运行 `npm run typecheck`，确保新增函数导入与调用无类型报错。

2. 新开局验证
- 清存档后开新局（Day 1），确认状态栏显示 `订单: 0/4`。
- 完成 4 单后应进入日结，第 5 单不应继续生成。

3. 切天验证
- 推进到 Day 7，确认仍是 `x/4`。
- 结算进入 Day 8 后，确认切换为 `x/5`，且当天可完成 5 单再日结。

4. 旧档兼容验证
- 使用旧存档（Day 1-7 且历史 `maxOrdersPerDay=5`）加载后，确认自动纠正为 `4`。
- 使用 Day 8+ 存档加载后，确认保持/纠正为 `5`。
