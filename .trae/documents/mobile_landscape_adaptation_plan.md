# 移动端横屏适配计划

## Summary

本次适配只覆盖**移动端横屏**，不做竖屏完整玩法支持。目标是：

1. 移动端默认按横屏体验优化，竖屏时仅提示用户横屏操作，但不强制阻断进入。
2. 所有核心可交互元素在移动端横屏下都**不能被 HUD 遮挡**。
3. 调酒交互统一改为 **Pointer 事件**，让桌面端鼠标与移动端触控共用一套拖拽逻辑。
4. 允许在移动端横屏下适度裁掉底部吧台装饰区域，但**示波器大屏、特殊事件/需求文本、实时提示、调酒工具区**必须完整显示。

## Current State Analysis

### 1. 视口与画布

- [index.html](file:///d:/Homework_vs/game-pr/index.html) 当前 viewport 只有 `width=device-width, initial-scale=1.0`，没有 `viewport-fit=cover`，也没有针对移动端横屏的提示层。
- [game-loop.ts](file:///d:/Homework_vs/game-pr/src/game/game-loop.ts#L56-L65) 当前画布直接硬跟随 `window.innerWidth/innerHeight`，未做横屏优先、safe area 或小高度策略。

### 2. 交互方式

- [game-loop.ts](file:///d:/Homework_vs/game-pr/src/game/game-loop.ts#L256-L389) 当前调酒拖拽只绑定 `mousedown / mousemove / mouseup`，移动端无法正常触控拖拽。
- 同文件中的调酒命中区使用大量固定矩形和固定偏移，后续若布局变化，必须同步更新命中区。

### 3. 调酒特写布局

- [bar-renderer.ts](file:///d:/Homework_vs/game-pr/src/ui/bar-renderer.ts#L69-L222) 当前 `mixing_view` 里桌面高度、杯子位置、左右道具区、示波器和信息框使用大量固定数值：
  - `tableY = h - 300`
  - 左侧酒瓶区 `x = 60`
  - 右侧添加剂区 `x = w - 620`
  - 高级工具区 `x = w - 380`
- 当前布局在横屏但高度较小的手机上容易出现“工具区、按钮区、信息框互相抢空间”的问题。

### 4. HUD 与遮挡风险

- [hud-renderer.ts](file:///d:/Homework_vs/game-pr/src/ui/hud-renderer.ts#L32-L365) 当前 HUD 由 DOM 绝对定位叠加在 Canvas 上。
- [styles.css](file:///d:/Homework_vs/game-pr/src/styles.css#L119-L179) 当前主要面板位置如下：
  - 状态面板左上固定
  - 动作汇总面板右下固定
  - 对话面板底部居中
  - `table-controls` 固定在 `bottom: 310px`
- [styles.css](file:///d:/Homework_vs/game-pr/src/styles.css#L275-L304) 现有移动端样式只有一个 `max-width: 768px` 媒体查询，没有专门针对“横屏手机低高度”进行布局调整。

### 5. 已确认的产品方向

- 竖屏处理：**仅提示可继续**，不强制阻断。
- 交互方案：**统一改 Pointer 事件**。
- 移动端横屏允许裁掉部分底部吧台装饰，但必须保证：
  - 示波器主屏完整显示
  - 特殊事件 / 需求信息完整显示
  - 实时提示完整显示
  - 调酒工具与拖拽落杯区完整可操作

## Proposed Changes

### 1. 增加移动端横屏/竖屏状态标识与提示层

**文件：** [index.html](file:///d:/Homework_vs/game-pr/index.html), [hud-renderer.ts](file:///d:/Homework_vs/game-pr/src/ui/hud-renderer.ts), [styles.css](file:///d:/Homework_vs/game-pr/src/styles.css)

#### 修改内容

- 在 [index.html](file:///d:/Homework_vs/game-pr/index.html) 的 viewport 中补充 `viewport-fit=cover`，为刘海区与横屏安全边距预留能力。
- 在 [hud-renderer.ts](file:///d:/Homework_vs/game-pr/src/ui/hud-renderer.ts) 增加一个“竖屏提示层” DOM：
  - 竖屏时显示“建议旋转到横屏体验”
  - 保持 `pointer-events: none` 或最小交互，不阻断进入
- 在 [styles.css](file:///d:/Homework_vs/game-pr/src/styles.css) 增加面向移动端的横竖屏媒体查询：
  - `orientation: portrait` 用于提示层显示
  - `orientation: landscape` 用于横屏移动端布局收束

#### 原因

- 当前项目没有任何横竖屏识别入口，无法优雅提示用户旋转设备。
- 竖屏不阻断，但要明确提示“最佳体验在横屏”。

### 2. 为移动端横屏建立专门的 HUD 布局规则

**文件：** [styles.css](file:///d:/Homework_vs/game-pr/src/styles.css), [hud-renderer.ts](file:///d:/Homework_vs/game-pr/src/ui/hud-renderer.ts)

#### 修改内容

- 将当前泛化的 `@media (max-width: 768px)` 拆分/扩展为“移动端横屏优先”的规则，重点覆盖：
  - `#status-panel`
  - `#actions-panel`
  - `#dialogue-panel`
  - `#result-panel`
  - `#table-controls`
- 移动端横屏下的布局目标：
  - 左上状态抽屉缩窄并限制最大高度，避免压住示波器区域
  - 右下汇总面板改为更窄、更矮、可换行的静态标签区
  - 对话框在 `guest_enter` 时贴底但留出桌面操作区
  - 调酒特写中的 `table-controls` 上移或改为贴近工具区，避免压在示波器信息框上
- 引入 `env(safe-area-inset-*)` 或等价安全边距变量，避免 HUD 贴到刘海/手势区。

#### 原因

- 当前 HUD 用桌面端绝对定位，横屏手机的主要问题不是宽度不够，而是**高度不足**。
- 这一步的核心是把 DOM HUD 收进角落，并给 Canvas 调酒区让出完整操作空间。

### 3. 重构 `mixing_view` 的画布布局为“按横屏手机高度收缩”

**文件：** [bar-renderer.ts](file:///d:/Homework_vs/game-pr/src/ui/bar-renderer.ts)

#### 修改内容

- 在 `drawMixingFocusView()` 内引入“移动端横屏布局分支”或统一布局参数对象，按 `w/h` 与移动端阈值计算：
  - 桌面高度
  - 道具区 y 偏移
  - 杯子位置
  - 示波器尺寸与 y 偏移
  - 信息框高度
  - 提示文字位置
- 移动端横屏下明确执行：
  - 适度裁掉底部桌面/吧台装饰可见面积
  - 保证示波器完整显示
  - 保证其下方需求/事件/提示不被 HUD 或桌面遮挡
  - 保证左右道具区与杯子落点完整落在可见区域内
- 不改变桌面端布局基调，只在移动端横屏启用更紧凑的参数。

#### 原因

- 仅靠 CSS 无法解决 Canvas 内部布局问题。
- 当前 `mixing_view` 的固定常量过多，必须在渲染层建立移动端横屏参数化布局。

### 4. 让命中区与渲染布局共用同一套参数

**文件：** [game-loop.ts](file:///d:/Homework_vs/game-pr/src/game/game-loop.ts), [bar-renderer.ts](file:///d:/Homework_vs/game-pr/src/ui/bar-renderer.ts)

#### 修改内容

- 抽出一套 `mixing_view` 布局计算函数，供渲染层和交互层共用，例如：
  - 桌面顶部/底部
  - 左侧酒瓶区矩形
  - 冰块区矩形
  - 右侧添加剂区矩形
  - 搅拌区矩形
  - 高级工具区矩形
  - 杯子投放区矩形
- [game-loop.ts](file:///d:/Homework_vs/game-pr/src/game/game-loop.ts#L265-L375) 不再手写一组与渲染层平行的固定命中盒，而是读取同一套布局数据。

#### 原因

- 当前布局和命中区是“人工同步”，移动端一旦收缩布局，极易出现“看得见但点不到”。
- 共用布局数据可以显著降低横屏适配时的回归风险。

### 5. 将调酒交互统一改为 Pointer 事件

**文件：** [game-loop.ts](file:///d:/Homework_vs/game-pr/src/game/game-loop.ts), [styles.css](file:///d:/Homework_vs/game-pr/src/styles.css)

#### 修改内容

- 将现有：
  - `mousedown`
  - `mousemove`
  - `mouseup`
- 统一替换为 Pointer 事件：
  - `pointerdown`
  - `pointermove`
  - `pointerup`
  - 视情况补 `pointercancel`
- 统一从 PointerEvent 中获取坐标，复用现有拖拽状态字段。
- 在 Canvas 或根容器上补充必要的 `touch-action` 样式，避免移动端拖拽时被页面默认滚动/缩放抢走事件。

#### 原因

- 这是满足“移动端横屏可操作”的必要条件。
- Pointer 事件能同时兼容桌面鼠标、触控和触控笔，优于额外维护一套 touch 分支。

### 6. 调整移动端横屏下的 HUD 显隐策略，避免遮挡交互

**文件：** [hud-renderer.ts](file:///d:/Homework_vs/game-pr/src/ui/hud-renderer.ts), [styles.css](file:///d:/Homework_vs/game-pr/src/styles.css)

#### 修改内容

- 保留当前“`mixing_view` 隐藏右下汇总面板”的策略，并进一步确认：
  - 移动端横屏调酒时，右下汇总面板不占操作区
  - 对话面板仅在 `guest_enter` / `dialogue` / `mixing` 出现，不侵入 `mixing_view`
  - `table-controls` 在移动端横屏下改为更紧凑布局，只保留不会压住关键信息的位置
- 若移动端横屏高度不足，可把某些纯展示元素（如部分状态明细）缩短或折叠，但不影响：
  - 开始调酒
  - 上酒 / 重做 / 档案室
  - 对话选择
  - 日结 / 继续 / 求救

#### 原因

- 用户明确要求“所有能交互的元素都不要被遮挡”。
- 这个要求不仅针对 Canvas 工具，也包括 DOM 层按钮与弹层。

## Assumptions & Decisions

- 仅做**移动端横屏**深度适配，不做竖屏完整玩法布局。
- 竖屏时只做提示，不禁止继续访问。
- 交互统一改为 Pointer 事件，不再单独维护一套 mouse + touch 双分支。
- 允许在移动端横屏下牺牲部分底部吧台装饰的可视面积，以换取操作区完整性。
- 本次适配以“不遮挡交互 + 可正常拖拽调酒”为第一优先级，视觉还原优先级次之。

## Verification Steps

1. 运行 `npm run typecheck`，确认布局参数抽取、Pointer 事件接入与 HUD 逻辑调整没有类型错误。
2. 在浏览器移动端模拟器中验证横屏手机尺寸：
   - `iPhone SE / 667x375`
   - `iPhone 12/13/14 横屏`
   - 常见 Android 横屏尺寸
3. 验证竖屏打开时会出现“建议横屏”提示，但不阻断页面继续显示。
4. 验证移动端横屏下：
   - 示波器完整显示
   - 特殊事件/需求文本完整显示
   - 实时提示完整显示
   - 左右调酒工具完整显示
   - 杯子投放区完整可见且可投放
5. 验证 HUD 不遮挡关键交互：
   - 左上状态抽屉不压住示波器和信息框
   - 右下汇总面板不压住调酒区
   - 对话框与结算按钮不遮挡核心拖拽区域
6. 验证 Pointer 交互：
   - 桌面端鼠标仍可正常拖拽
   - 移动端触控可正常拖起道具并投入杯中
   - 取消拖拽/拖出区域时状态能正确恢复
