# 全流程 Demo 完整闭环开发计划

## 当前状态分析
根据对代码库的检索，当前项目已经具备了“能跑的原型骨架”（Canvas 渲染、高精像素资产、拖拽交互、基础状态机）。但各个子系统（如经济、存档、音频、事件）仍处于占位或高度耦合状态（例如经济结算逻辑硬编码在 `game-loop.ts` 中）。为了打造一个真正的最小闭环 Demo，需要按优先级收束核心流程，深化玩法，补齐表现，并夯实工程基础。

## 提议的变更与执行路径

### P0：先把闭环收住 (Core Loop Closure)
**目标**：打通 `调酒 -> 结算 -> 日结 -> 下一天 -> 存档` 的完整链路。
1. **状态流转重构 (`src/game/game-loop.ts`)**：
   - 明确状态流转规则：`idle` -> `guest_enter` -> `dialogue` -> `mixing_view` -> `result` -> `resource_settlement` -> `game_over`。
   - 稳定“下一位客人”、“提交”、“下一天”、“破产重开”的触发逻辑。
2. **全局状态扩展 (`src/game/game-state.ts`)**：
   - 增加 `activeEvent`, `guestAffinity`, `inventory`, `saveVersion`, `maxOrdersPerDay` 等字段。
3. **UI 渲染纯状态化 (`src/ui/hud-renderer.ts` & 面板文件)**：
   - 让按钮显示逻辑完全由 `orderFlow` 驱动，确保每个场景只显示应该出现的操作。
   - 清理或真正实现 `dialogue-panel.ts` 和 `result-panel.ts`，避免逻辑分散在空壳中。
4. **存档系统升级 (`src/systems/save/save-system.ts`)**：
   - 升级为带版本号的自动存读档，接入每单结束和每日结算节点。
5. **经济系统完善 (`src/systems/economy/economy-system.ts`)**：
   - 抽取并补全完整的结算逻辑：金钱（收入/房租）、评分（增减）、电力（消耗）、失败惩罚和成功奖励。
6. **事件系统接入 (`src/systems/event/event-system.ts`)**：
   - 实现 `pickDailyEvent()`，从返回 `null` 变成真正抽取事件，首批支持雨天、缺冰、网红直播三类。

### P1：把玩法做深 (Gameplay Depth)
**目标**：扩展调酒维度，增加波形匹配深度与动态内容。
1. **调酒状态与动作扩展 (`src/systems/mixology/*`)**：
   - `drink-state.ts`：补齐 `dilution`, `oxidation`, `smoke`, `aroma`。
   - `mix-actions.ts`：增加 `shake`, `muddle`, `pour_precise`, `flame` 的基础操作占位，为后续内容留接口。
   - `mixology-system.ts`：细化状态机，加入容量上限、溢出惩罚、顺序记录和过量惩罚。
2. **波形与匹配升级 (`src/systems/wave/*`)**：
   - `wave-generator.ts`：将酸度、气泡、顺序、混合度等维度更明确地映射到波形参数。
   - `wave-match.ts`：从单纯 MSE 升级为带权重的匹配，至少把“基础形状”、“末端衰减”、“高频噪声”分开计分。
3. **动态内容生成 (`src/content/*` & `src/systems/npc/npc-system.ts`)**：
   - `orders.ts`：改为“模板 + 波动”的动态生成方式，支持天数增长后的复杂度上升。
   - `guests.ts`：补充好感阶段、偏好标签和对话节点，为后续接档案收集做准备。
   - `ingredients.ts` / `spirits.ts`：数值标准化，避免后续平衡时到处改常量。
   - `events.ts` / `upgrades.ts`：扩充为能被系统消费的正式数据源。
   - `npc-system.ts`：扩充 `createGuestOrder`，实现真正的 NPC 订单生成与好感推进接口。

### P2：把表现补齐 (Presentation & Polish)
**目标**：完善视听反馈与外围包装。
1. **音频系统 (`src/audio/audio-system.ts`)**：
   - 实现真正的 Web Audio 合成，优先做出倒酒、冰块、提交成功、失败四个反馈音。
2. **视觉打磨 (`src/ui/bar-renderer.ts` & `pixel-assets.ts`)**：
   - 继续统一视觉规范，保留目前的像素风方向，对道具、杯子、示波器和拖拽预览进行最后一轮打磨。
3. **界面与外壳 (`src/styles.css` & `index.html` & `src/main.ts`)**：
   - `styles.css`：整理 UI 面板、按钮、布局，形成可维护的样式结构。
   - `index.html`：补充 loading、标题、启动菜单的最基础外壳。
   - `main.ts`：加入启动读档、初始场景选择、错误兜底等入口逻辑。
4. **清理冗余 (`src/game/scene-manager.ts`)**：
   - 评估当前只有类型的空文件，要么实现真正的场景管理器，要么将其合并删除。

### P3：工程与验证 (Engineering & CI)
**目标**：确保项目构建稳定，文档同步。
1. **构建配置 (`package.json`, `vite.config.ts`, `tsconfig.json`)**：
   - 确保 `build`, `typecheck`, `dev` 稳定可用。
   - 处理 Windows 上的构建兼容问题，保证 `vite build` 跑通。
   - 配置路径别名或更严格的类型检查。
2. **文档同步 (`docs/*`)**：
   - 将实际完成度同步回 `mvp-task-list.md`, `mvp-data-templates.md`, `cyber-resonance-bar-plan.md`，避免文档比代码超前。
3. **验证标准**：
   - 每完成一阶段，必须执行一次 `tsc --noEmit` 和 `vite build`，确认不仅逻辑完成，工程上也绝对稳定。

## 验证步骤
1. 完成 P0 后，玩家可体验：打开游戏 -> 迎接 5 位客人 -> 资源结算扣除 -> 自动保存 -> 刷新页面后读取进度 -> 开启下一天，形成无限闭环。
2. 完成 P1 后，调酒杯满会溢出，波形匹配度计算更加科学，客人订单具备随机波动性。
3. 完成 P2 后，游戏拥有完整的 Web Audio 音效反馈和初始菜单界面。
4. 完成 P3 后，运行 `npm run build` 无任何警告或类型错误。
