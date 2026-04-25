# 多轮选项对话系统实现计划

## 摘要

目前游戏中的对话系统是单向的（NPC 说一句话，玩家点击“下一位/开始调酒”）。为了让 NPC 更加鲜活，符合 RPG 的体验，本计划将重构对话系统，支持**多轮对话树**和**玩家选项**。玩家的选择将可以触发不同的回答，甚至影响隐藏的属性。

## 现状分析

* **状态 (`game-state.ts`)**：只有 `currentDialogue: string | null`，无法存储复杂的对话树或选项。

* **内容 (`guests.ts`)**：对话被定义为简单的字符串数组（如 `affinityLevels.neutral` 是 `string[]`）。

* **UI (`hud-renderer.ts`)**：对话面板 (`#dialogue-panel`) 只有一个硬编码的 `#btn-next` 按钮，无法动态显示选项。

* **逻辑 (`npc-system.ts`)**：只能随机抽取一句话，没有“对话推进”或“跳转分支”的概念。

## 提议更改

### 1. 数据结构设计 (`src/content/guests.ts` & `types`)

引入新的 `DialogueNode` 接口来替代简单的字符串：

```typescript
export interface DialogueOption {
  text: string;
  nextId?: string; // 跳转到哪个节点，如果为空则结束对话并进入调酒
  affinityChange?: number; // 选这个选项是否改变好感度
}

export interface DialogueNode {
  id: string;
  text: string;
  options: DialogueOption[];
}
```

*注：为了兼容旧版代码，现有的单句随机对话将自动包装成只有一个“听着 / 倒酒”选项的* *`DialogueNode`。*

### 2. 状态扩展 (`src/game/game-state.ts`)

* 修改 `currentDialogue` 的类型为 `DialogueNode | null`。

* 增加 `currentDialogueTree` 来存储当前触发的整个多轮对话树。

### 3. UI 重构 (`src/ui/hud-renderer.ts` & `index.html`)

* 在 `#dialogue-panel` 中，将固定的 `#btn-next` 替换为一个动态的选项容器（如 `#dialogue-options`）。

* 在 `renderHud` 时，遍历 `state.currentDialogue.options`，为每个选项动态生成一个按钮。

### 4. 逻辑实现 (`src/systems/npc/npc-system.ts` & `main.ts`)

* 实现 `handleDialogueOption(optionIndex)` 函数：

  * 更新好感度（如果有 `affinityChange`）。

  * 如果有 `nextId`，则在树中查找对应节点并更新 `state.currentDialogue`，触发 UI 重绘。

  * 如果没有 `nextId`，则结束对话阶段，将 `orderFlow` 切入 `mixing` 阶段，准备调酒。

### 5. 内容实装 (`src/content/guests.ts`)

* 挑选 2 个代表性角色（如老陈 `mechanic_01` 和 Z3R0 `hacker_01`），为其在 `neutral` 或 `friendly` 阶段编写带有 2-3 个分支的专属多轮对话树。

* 例如老陈：

  * 老陈：“今天的义体回收市场真是糟透了...”

  * 选项 A：“怎么了，又收到残次品？” -> 跳转到节点 B（老陈抱怨大公司，好感+5）

  * 选项 B：“来杯酒压压惊吧。” -> 结束对话，开始调酒

## 假设与决策

* **触发机制**：为了控制开发规模，目前的触发机制仍为随机抽取。在 `guest_enter` 时，有概率抽取到一条“单句对话”，也有概率抽取到一个“多轮对话树的起始节点”。

* **UI 风格**：选项按钮将采用赛博朋克风格的线框按钮，垂直排列在对话文本下方。

## 验证步骤

1. 修改代码并运行。
2. 等待特定客人（如老陈）入场，观察对话框。
3. 验证对话文本下方是否出现了多个选项按钮。
4. 点击不同选项，验证是否能正确跳转到后续对话，或正确结束对话进入调酒界面。

