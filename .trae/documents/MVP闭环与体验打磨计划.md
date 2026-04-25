# MVP 闭环与体验打磨执行计划

## Summary

本计划旨在修补游戏内逻辑与机制上的漏洞（如不回电、旧事件残留、假解锁、经济区分不足、容量不一致等），并提升核心体验（HUD 信息、档案总览、音效丰富度）。

## Current State Analysis

1. **日结未补电**：`economy-system.ts` 和 `game-loop.ts` 仅扣租金，导致电力持续枯竭。
2. **事件残留**：`event-system.ts` 抽取事件失败时（如 50% 概率），未清空前一日的 `activeEvent`。
3. **假解锁**：`muddle_tool` (摇壶) 和 `flame_tool` (喷枪) 在 Day 10 解锁，但在 `bar-renderer.ts` 和 `game-loop.ts` 中无渲染与点击判定。
4. **订单数值闲置**：`orders.ts` 中的 `rewardBase` 和 `allowVariance` 未被结算和订单生成逻辑使用。
5. **容量规则分裂**：状态 `maxVolume` 为 300，惩罚阈值 200，渲染高度按 100 比例计算，导致视觉溢出杯外且结算不统一。
6. **信息遮挡**：调酒界面 (`mixing_view`) 隐藏了对话面板，玩家无法回顾订单需求。
7. **道具命名错位**：“捣拌棒”图标仍为液体瓶 (`tonic_vial`)，重绘捣拌棒图标，。
8. **档案功能受限**：只能查看当前客人的弹窗，缺乏全客人的总览页面。
9. **UI 适配问题**：固定定位导致移动端拥挤。
10. **Vite Build**：存在潜在的不稳定情况，需验证和配置修复。

## Proposed Changes

### 第一阶段：修补规则闭环

1. **恢复每日基础电力**：

   * 文件：`src/systems/economy/economy-system.ts` (`resetDailyLedger` 或新增补电函数)

   * 修改点：日结/进入下一天时，将 `state.resources.power` 消耗资金补充电力至满电（一点资金对应一点电力）。
2. **清理过期事件**：

   * 文件：`src/systems/event/event-system.ts`

   * 修改点：在 `pickDailyEvent` 开头强制 `state.activeEvent = null`，确保未抽中新事件时旧事件失效。
3. **统一容量规则 (200ml 基准)**：

   * 文件：`src/systems/mixology/drink-state.ts`

     * 修改点：将 `maxVolume` 设定为 200。

   * 文件：`src/game/game-loop.ts`

     * 修改点：保持 `volume > 200` 触发溢出惩罚。

   * 文件：`src/ui/bar-renderer.ts`

     * 修改点：在 `drawPixelCup` 中，将液体高度计算公式修改为 `Math.min(drink.volume, 200) / 200`，确保液体不会溢出杯口。
4. **激活订单经济差异**：

   * 文件：`src/systems/npc/npc-system.ts`

     * 修改点：在 `generateNextGuest` 中，使用 `baseOrder.allowVariance` 替代硬编码的波动率。

   * 文件：`src/systems/economy/economy-system.ts`

     * 修改点：`applyOrderIncome` 使用 `state.currentOrder.rewardBase` 计算基础收入，替代 `balanceConfig.baseOrderPrice`。

### 第二阶段：补完真 MVP 缺口

1. **调酒时显式订单摘要与事件**：

   * 文件：`src/ui/bar-renderer.ts` 或 `src/ui/hud-renderer.ts`

   * 修改点：在 `mixing_view` 状态下，在屏幕上方或侧边悬浮显示客人的 `moodText`（需求）和当前的 `activeEvent` 提示。
2. **增加进阶道具 UI 占位**：

   * 文件：`src/ui/bar-renderer.ts`

     * 修改点：在高级工具行渲染 `muddle_tool`（摇壶）和 `flame_tool`（喷枪）的占位图标。

   * 文件：`src/game/game-loop.ts`

     * 修改点：补充对应区域的 Hitbox 命中检测，使玩家可拖拽占位道具。
3. **完善事件的实际影响**：

   * 文件：`src/systems/wave/wave-match.ts` 或 `src/game/game-loop.ts`

     * 修改点：“酸雨夜”降低目标波形 `decay`（温度）带来的惩罚权重。“冷链故障”在 `applyIngredientCost` 中使冰块扣电量翻倍（1 -> 2）。
4. **修正“捣拌棒”图像**：

   * 文件：`src/ui/pixel-assets.ts` 和 `src/ui/bar-renderer.ts`

     * 修改点：将 `tonic_vial` 的像素图替换为物理搅拌棒的外观，消除“液体材料”的视觉误导。

### 第三阶段：打磨内容与体验

1. **全局档案页 (Archive Overview)**：

   * 文件：`src/ui/hud-renderer.ts`

     * 修改点：新增“档案室”按钮与对应模态框，列出所有客人（`GuestsDB`），并显示已解锁的记忆碎片与传记。
2. **移动端样式适配**：

   * 文件：`src/styles.css`

     * 修改点：对 `actions-panel` 等面板使用媒体查询（`@media (max-width: 768px)`），调整为 Flex 弹性布局，避免重叠。
3. **丰富音效反馈**：

   * 文件：`src/audio/audio-system.ts`

     * 修改点：为 `stir`、`shake` 等动作增加区分度更高的合成音效。
4. **Vite Build 稳定性**：

   * 文件：`package.json` 或 `vite.config.ts`

     * 修改点：确认并调整 Rollup / Vite 配置，确保打包在 Windows 环境下不报错。

## Assumptions & Decisions

* 补电策略：设定每日固定消耗资金恢复至 满电力，维持游戏长线可玩性。

* 假解锁处理：暂不实现 `muddle_tool` / `flame_tool` 复杂逻辑，仅提供 UI 与拖拽交互占位，为后续扩展留口。

* 容量表现：超出 200ml 时不再绘制更高的液面，仅在后台触发惩罚，避免画面穿帮。

## Verification Steps

1. 观察进入下一天时电力是否重置。
2. 观察事件在未抽中时是否正确清除。
3. 检查 `mixing_view` 界面是否出现需求摘要文本。
4. 验证高级道具区是否有压碎棒和喷枪，且拖拽正常。
5. 测试调酒容量达 250ml 时，液面不超过杯口且正确扣分。
6. 测试不同订单收入是否拉开差距。
7. 运行 `npm run build` 确认构建成功。

