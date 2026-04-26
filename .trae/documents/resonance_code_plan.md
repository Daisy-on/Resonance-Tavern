# 社交功能：共振码 (Resonance Code) 开发计划

## 1. 目标与背景 (Summary)
实现一个基于“共振码”的轻量级异步社交与救援系统。
当玩家完成高匹配度（>=95%）的订单时，可生成并复制一段“共振码”。当玩家在日结时处于资源危险状态，或因耗材导致资源归零（Game Over）时，可以输入好友分享的“共振码”来获取动态的资源救援，从而防止破产。

## 2. 现状分析 (Current State Analysis)
- **游戏结束逻辑**：`checkGameOver` 会在资金、电力、评分任意一项 `<= 0` 时触发，并在 `game-loop.ts` 的各个操作节点中将 `orderFlow` 切换为 `"game_over"`。
- **结算界面**：当 `orderFlow === "result"` 时，会显示调酒评分与具体匹配度。
- **日结界面**：当 `orderFlow === "resource_settlement"` 时，会显示当日的收支。

## 3. 具体修改方案 (Proposed Changes)

### 3.1 扩展游戏状态 (Game State)
**文件**：`src/game/game-state.ts`
- 在 `GameState` 接口中新增：
  - `hasUsedResonanceCode: boolean`：记录本局是否已使用过救援（单局限用 1 次）。
  - `previousFlow?: OrderFlowState`：记录触发 `game_over` 前的状态，用于复活后恢复流程。
- 在 `createDefaultGameState` 中初始化这些字段。

### 3.2 新增共振码逻辑模块
**文件**：`src/systems/social/resonance-system.ts` (新建)
- **生成机制 (`generateResonanceCode`)**：
  - 输入：`score` 和 `difficulty`。
  - 逻辑：生成一个包含分数、难度及简单校验位的 JSON 对象，使用 `btoa` 进行 Base64 编码，并加上 `CRB-` 前缀（例如：`CRB-ey...`）。
- **解析与奖励计算 (`parseResonanceCode`)**：
  - 逻辑：解析 Base64 并验证格式。
  - 奖励公式（动态难度奖励）：
    - `money = 30 + difficulty * 15 + (score - 95) * 2`
    - `power = 10 + difficulty * 3`
    - `rating = 10 + (score - 95)`
  - 返回：奖励对象或 `null`（若无效）。

### 3.3 修改主循环与状态分发 (Game Loop)
**文件**：`src/game/game-loop.ts`
- **保存前置状态**：在每次触发 `currentState.orderFlow = "game_over"` 前，先记录 `currentState.previousFlow = currentState.orderFlow`。
- **处理救援 Action**：
  - 增加对 `action.type === "use_resonance_code"` 的处理。
  - 若解析成功且未曾使用过：
    - `state.hasUsedResonanceCode = true`
    - 为 `money`, `power`, `rating` 加上奖励数值。
    - 如果当前是 `game_over` 且资源已恢复至安全值，将 `orderFlow` 恢复为 `state.previousFlow || "idle"`。

### 3.4 渲染与 UI 交互 (HUD Renderer)
**文件**：`src/ui/hud-renderer.ts`
- **生成按钮**：在 `result-panel` 的渲染逻辑中，当 `state.lastScore >= 95` 时，新增一个 `[生成共振码]` 按钮。点击后调用生成函数，使用 `navigator.clipboard.writeText` 写入剪贴板并给视觉提示。
- **危险提示与复活按钮**：
  - 定义条件：`canRescue = !state.hasUsedResonanceCode`。
  - 危险判定：`isDanger = money < 30 || power < 10 || rating < 20`。
  - 在 `resource_settlement` 面板，若 `canRescue && isDanger`，显示 `[输入共振码求救]` 按钮。
  - 在 `game_over` 面板，若 `canRescue`，显示 `[输入共振码复活]` 按钮。
- **输入模态框**：
  - 增加一个简单的 `prompt` 交互（或者直接使用 `window.prompt` 结合 alert 提示，保持简单且可靠，避免过度复杂的 DOM 状态管理）。
  - 获取输入后 `dispatch({ type: "use_resonance_code", payload: code })`。

## 4. 假设与决策 (Assumptions & Decisions)
- **单局限用1次**：为了保持生存压力，每开一局（从 Day 1 开始）只能使用一次求救。
- **动态奖励机制**：救援奖励将与分享者的“单次表现”挂钩，高难度的订单（如 Day 10 的复杂订单）生成的共振码能提供更多的资源，鼓励玩家交流后期的高质量代码。
- **极限危险值**：将日结求救的判定门槛设为 资金<30，电力<10，评分<20，避免玩家在资源充足时滥用求救系统。

## 5. 验证步骤 (Verification steps)
1. `npm run typecheck` 确认接口变动。
2. 进入游戏，故意消耗资源至归零，验证 `game_over` 界面是否出现复活按钮，使用伪造共振码是否能复活并恢复调酒状态。
3. 正常完成一杯 >=95 分的酒，验证结算界面是否出现生成按钮，剪贴板是否能复制成功。
4. 在资源低于危险值时进入日结，验证是否出现求救按钮，使用成功后是否单局内不再出现。
