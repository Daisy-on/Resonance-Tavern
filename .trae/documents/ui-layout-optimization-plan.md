# UI 表现优化计划 - 道具尺寸与布局调整

本计划旨在根据用户反馈，精细化调整调酒界面中基酒、搅拌工具及添加剂道具的大小和位置，提升视觉整齐度。

## 当前状态分析

1.  **基酒大小**：威士忌和朗姆酒目前与伏特加、金酒大小一致（80像素），视觉上可能显得不够突出。
2.  **搅拌工具**：目前的顺时针/逆时针搅拌棒是横向放置的线条，不符合常规搅拌棒竖立在杯边的直觉。
3.  **柠檬位置**：柠檬切片的位置（y+40）低于其他同排道具（y），且与“柠檬”文字对齐不精确。
4.  **高级工具对齐**：第二排的高级工具（摇壶、量杯、喷枪）与第一排道具的水平间距和相对位置不统一。

## 拟定修改方案

### 1. 优化基酒酒瓶 (bar-renderer.ts)
- **威士忌 (Whisky)**：将 `drawPixelSprite` 的尺寸从 `80` 增加到 `95`，并微调 `x` 偏移以保持居中。
- **朗姆酒 (Rum)**：将 `drawPixelSprite` 的尺寸从 `80` 增加到 `95`，并微调 `x` 偏移以保持居中。

### 2. 竖直化搅拌棒 (bar-renderer.ts)
- 修改 `drawStirTools` 函数：
    - 将 `lineTo` 绘制的横线改为竖线（长度约 60 像素）。
    - 调整“顺搅”和“逆搅”文字到竖棒的正下方。
    - 同步调整未解锁遮罩层 (`drawLockedOverlay`) 的位置。

### 3. 修正柠檬位置 (bar-renderer.ts)
- 修改 `drawAdditivesSet` 中的柠檬绘制逻辑：
    - 将 `y + 40` 改为 `y`，使其与糖浆、苏打水等道具在同一水平线上。
    - 微调 `x` 坐标，确保其位于“柠檬”文本的正下方。

### 4. 高级工具对齐 (bar-renderer.ts)
- 修改 `drawAdvancedTools` 函数：
    - 调整摇壶、量杯、喷枪的 `x` 增量（从 90, 180 调整为与第一排间距一致的约 100-120 像素）。
    - 确保工具图标相对于其标题文字的对齐方式与第一排一致（文字在上方，图标在下方）。

## 修改位置指南 (供后续微调参考)

1.  **基酒大小与文字**：`drawSpiritsSet` 函数 ([L235](file:///d:/Homework_vs/game-pr/src/ui/bar-renderer.ts#L235))。
2.  **添加剂布局 (含柠檬)**：`drawAdditivesSet` 函数 ([L267](file:///d:/Homework_vs/game-pr/src/ui/bar-renderer.ts#L267))。
3.  **搅拌棒形状**：`drawStirTools` 函数 ([L297](file:///d:/Homework_vs/game-pr/src/ui/bar-renderer.ts#L297))。
4.  **高级工具布局**：`drawAdvancedTools` 函数 ([L316](file:///d:/Homework_vs/game-pr/src/ui/bar-renderer.ts#L316))。
5.  **整体模块位置**：`drawMixingFocusView` 中的调用部分 ([L96-113](file:///d:/Homework_vs/game-pr/src/ui/bar-renderer.ts#L96-113))。

## 验证步骤

1. 进入调酒特写页面。
2. 观察威士忌和朗姆酒瓶是否比之前更大更高。
3. 确认搅拌棒是否已变为竖直状态且文字位置正确。
4. 检查柠檬是否已上移并与其他添加剂对齐。
5. 检查第二排工具是否与第一排工具整齐对齐。
