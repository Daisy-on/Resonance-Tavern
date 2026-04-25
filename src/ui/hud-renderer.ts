import type { GameState } from "../game/game-state";
import { GuestsDB } from "../content/guests";
import { getEventDescription } from "../systems/event/event-system";

type Dispatch = (actionType: any) => void;

let isInitialized = false;
let lastState: GameState | null = null;
let isArchiveOpen = false;

const GUEST_ACCENT_COLORS: Record<string, string> = {
  mechanic_01: "#ff9b73",
  hacker_01: "#73f2ff",
  cop_01: "#7ddf8f",
  exec_01: "#d4a6ff",
  idol_01: "#ff73a8",
  robot_01: "#a0b8ff",
  drifter_01: "#ffd973",
};

function getGuestAccentColor(guestId: string | null): string {
  if (!guestId) return "#ff73a8";
  return GUEST_ACCENT_COLORS[guestId] ?? "#ff73a8";
}

export function renderHud(state: GameState, dispatch: Dispatch) {
  lastState = state;
  const uiLayer = document.getElementById("ui-layer");
  if (!uiLayer) return;

  if (!isInitialized) {
    uiLayer.innerHTML = `
      <div id="status-panel" class="panel">
        <div id="status-toggle">
          <h3 style="margin:0; font-size: 1.1em; letter-spacing: 1px;">状态 STATUS</h3>
          <span id="toggle-icon">[+]</span>
        </div>
        <div id="status-content">
          <div id="status-text" style="margin-top:10px;"></div>
          <hr style="border-color:#73f2ff; margin: 10px 0; opacity: 0.3;">
          <h4 style="margin:0 0 5px 0; color:#ff73a8;">待解锁物品</h4>
          <div id="locked-list" style="font-size:0.9em; color:#aaa; line-height:1.6;"></div>
        </div>
      </div>
      
      <div id="table-controls" style="display:none;">
        <button class="table-btn" data-action="reset">重做</button>
        <button class="table-btn" id="btn-submit" data-action="submit">上酒</button>
        <button class="table-btn" id="btn-profile-table">档案室</button>
      </div>

      <div id="actions-panel" class="panel">
        <h4 style="margin:0 0 10px 0; color:#ff73a8; font-family:'Courier New', Courier, monospace;">基酒 SPIRITS</h4>
        <button class="btn" id="btn-vodka" data-action="select_vodka">伏特加</button>
        <button class="btn" id="btn-gin" data-action="select_gin">金酒</button>
        <button class="btn" id="btn-whisky" data-action="select_whisky">威士忌</button>
        <button class="btn" id="btn-rum" data-action="select_rum">朗姆酒</button>
        
        <h4 style="margin:10px 0; color:#ff73a8; font-family:'Courier New', Courier, monospace;">添加剂 ADDITIVES</h4>
        <button class="btn" data-action="add_syrup">糖浆 (周期-)</button>
        <button class="btn" data-action="add_ice">冰块 (振幅-)</button>
        <button class="btn" data-action="add_tonic">捣拌棒 (周期+)</button>
        <button class="btn" data-action="stir_cw">顺时针搅拌 (相位+)</button>
        <button class="btn" data-action="stir_ccw">逆时针搅拌 (相位-)</button>
        <button class="btn" data-action="add_lemon">柠檬 (边缘+)</button>
        <button class="btn" data-action="add_soda">苏打水 (毛刺+)</button>
        <button class="btn" data-action="add_bitters">苦精 (容错+)</button>
        <button class="btn" data-action="shake">摇壶 (谐波+)</button>
        <button class="btn" data-action="measure_cup">量杯 (平滑++)</button>
        <button class="btn" data-action="flame">喷枪 (拖尾+)</button>
        
        <hr style="border-color:#73f2ff; margin: 10px 0; opacity: 0.3;">
        <button class="btn" data-action="reset">重做</button>
        <button class="btn" id="btn-submit-orig" data-action="submit" style="border-color:#ff73a8; color:#ff73a8;">上酒</button>
      </div>
      <div id="dialogue-panel" class="panel" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom: 1px solid rgba(255,115,168,0.3); gap:10px;">
          <div id="guest-avatar-color" style="width:8px; height:28px; background:#ff73a8;"></div>
          <div style="flex:1;">
            <div id="guest-name" style="font-weight:bold; color:#ff73a8;"></div>
            <div id="guest-title" style="font-size:0.85em; color:#73f2ff; opacity:0.85;"></div>
          </div>
        </div>
        <div id="guest-dialogue" style="font-size:1.1em; line-height:1.4; min-height: 3em;"></div>
        <div id="dialogue-options" style="margin-top:10px; display:flex; flex-direction:column; gap:8px;"></div>
        <button class="btn" id="btn-next" style="margin-top:10px;">接受订单</button>
      </div>
      <button id="btn-profile" class="btn" style="display:none;">档案室</button>
      <div id="result-panel" class="panel" style="display:none; min-width:320px; text-align:center;">
        <h2 id="result-title" style="margin-top:0; color:#73f2ff;"></h2>
        <div id="result-score" style="margin:20px 0;"></div>
        <div id="result-desc" style="margin-bottom:20px; font-style:italic; color:#aaa;"></div>
        <button class="btn" id="btn-result-next" style="width:100%; padding: 12px;">继续</button>
      </div>
      <div id="archive-overlay" class="modal-overlay" style="display:none;">
        <div class="archive-modal">
          <button class="btn" id="btn-close-archive" style="position:absolute; top:20px; right:20px;">关闭 X</button>
          <div id="archive-content"></div>
        </div>
      </div>
    `;

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (!lastState) return;

      // Handle dialogue options
      const dialogueOptionBtn = target.closest(".dialogue-option-btn");
      if (dialogueOptionBtn) {
        const optionIndex = parseInt(dialogueOptionBtn.getAttribute("data-option-index") || "0", 10);
        dispatch({ type: "select_dialogue_option", payload: optionIndex });
        return;
      }

      // Handle drawer toggle
      if (target.id === "status-toggle" || target.closest("#status-toggle")) {
        const panel = document.getElementById("status-panel");
        const icon = document.getElementById("toggle-icon");
        if (panel && icon) {
          panel.classList.toggle("expanded");
          icon.textContent = panel.classList.contains("expanded") ? "[-]" : "[+]";
        }
        return;
      }

      // Handle buttons with data-action
      const actionBtn = target.closest(".btn[data-action], .table-btn[data-action]");
      if (actionBtn) {
        const action = actionBtn.getAttribute("data-action");
        dispatch(action);
        return;
      }

      // Handle specific IDs
      if (target.id === "btn-next" || target.closest("#btn-next")) {
        dispatch("take_order");
      }
      if (target.id === "btn-profile" || target.closest("#btn-profile") || target.id === "btn-profile-table") {
        isArchiveOpen = true;
        renderArchive(lastState);
      }
      if (target.id === "btn-close-archive" || target.closest("#btn-close-archive")) {
        isArchiveOpen = false;
        const overlay = document.getElementById("archive-overlay");
        if (overlay) overlay.style.display = "none";
      }
      if (target.id === "btn-result-next" || target.closest("#btn-result-next")) {
        const flow = lastState.orderFlow;
        if (flow === "idle") dispatch("next_guest");
        else if (flow === "result") dispatch("next_guest");
        else if (flow === "resource_settlement") dispatch("next_day");
        else if (flow === "game_over") dispatch("restart");
      }
    });

    document.querySelectorAll("#actions-panel .btn[data-action]").forEach((btn) => {
      const button = btn as HTMLButtonElement;
      button.dataset.label = button.textContent || "";
    });

    isInitialized = true;
  }

  // 1. Update Status Panel
  const statusText = document.getElementById("status-text");
  if (statusText) {
    statusText.innerHTML = `
      第 ${state.day} 天 | 订单: ${state.ordersCompletedToday}/${state.maxOrdersPerDay}<br/>
      资金: $${state.resources.money.toFixed(1)}<br/>
      电力: ${state.resources.power.toFixed(1)}<br/>
      评分: ${state.resources.rating.toFixed(1)}<br/>
      今日耗材: $${state.dailyLedger.ingredientCostToday.toFixed(1)}<br/>
      今日收入: $${state.dailyLedger.orderIncomeToday.toFixed(1)}<br/>
      今日净收益: $${(state.dailyLedger.orderIncomeToday - state.dailyLedger.ingredientCostToday - state.dailyLedger.rentToday).toFixed(1)}<br/>
      今日冰耗电: ${state.dailyLedger.powerFromIceToday.toFixed(1)}
    `;
  }

  // 1.5 Update Locked Panel (Inside Drawer)
  const lockedList = document.getElementById("locked-list");
  if (lockedList) {
    const allUnlockables = [
      { id: "lemon_juice", name: "柠檬 (Day 3)", day: 3 },
      { id: "soda_water", name: "苏打水 (Day 3)", day: 3 },
      { id: "rum", name: "朗姆酒 (Day 4)", day: 4 },
      { id: "measure_cup", name: "量杯 (Day 8)", day: 8 },
      { id: "shake_tool", name: "摇壶 (Day 8)", day: 8 },
      { id: "flame_tool", name: "喷枪 (Day 8)", day: 8 },
      { id: "bitters", name: "苦精 (Day 8)", day: 8 },
    ];

    const lockedItems = allUnlockables.filter(item => !state.inventory.includes(item.id));
    if (lockedItems.length > 0) {
      lockedList.innerHTML = lockedItems
        .map(item => `<div>• ${item.name}</div>`)
        .join("");
    } else {
      lockedList.innerHTML = "<div style='color:#73f2ff;'>全部物品已解锁</div>";
    }
  }

  // 1.6 Show/Hide Table Controls
  const tableControls = document.getElementById("table-controls");
  if (tableControls) {
    tableControls.style.display = state.orderFlow === "mixing_view" ? "flex" : "none";
  }

  // 2. Update Actions Panel (Mixing buttons)
  const isMixing = state.orderFlow === "mixing" || state.orderFlow === "guest_enter" || state.orderFlow === "mixing_view";
  const actionsPanel = document.getElementById("actions-panel");
  if (actionsPanel) {
    // Hide actions panel entirely in mixing_view to avoid blocking
    actionsPanel.style.display = state.orderFlow === "mixing_view" ? "none" : "block";

    // Original buttons visibility logic
    const spiritGroup = actionsPanel.querySelectorAll("button[data-action^='select_'], button[data-action^='add_'], button[data-action='stir'], button[data-action='stir_cw'], button[data-action='stir_ccw']");
    spiritGroup.forEach(btn => {
      (btn as HTMLElement).style.display = "inline-block";
    });
    const headers = actionsPanel.querySelectorAll("h4");
    headers.forEach(h => {
      (h as HTMLElement).style.display = "block";
    });
  }

  document.querySelectorAll(".btn, .table-btn").forEach((btn) => {
    const action = btn.getAttribute("data-action");
    const actionUnlockMap: Record<string, string> = {
      select_vodka: "vodka",
      select_gin: "gin",
      select_whisky: "whisky",
      select_rum: "rum",
      add_syrup: "simple_syrup",
      add_lemon: "lemon_juice",
      add_ice: "ice_cube",
      add_soda: "soda_water",
      add_tonic: "tonic_essence",
      add_bitters: "bitters",
      stir: "stir_tool",
      stir_cw: "stir_tool",
      stir_ccw: "stir_tool",
      shake: "shake_tool",
      measure_cup: "measure_cup",
      flame: "flame_tool",
    };
    const requiredUnlock = action ? actionUnlockMap[action] : null;
    const isUnlocked = !requiredUnlock || state.inventory.includes(requiredUnlock);

    if (action === "submit") {
      (btn as HTMLButtonElement).disabled = !isMixing || state.drink.volume === 0;
    } else if (action === "reset") {
      (btn as HTMLButtonElement).disabled = !isMixing;
    } else if (action && action.startsWith("select_")) {
      (btn as HTMLButtonElement).disabled = !isMixing || state.drink.baseSpirit !== null || !isUnlocked;
    } else if (action) {
      (btn as HTMLButtonElement).disabled = !isMixing || !isUnlocked;
    }

    if (btn.classList.contains("btn")) {
      const button = btn as HTMLButtonElement;
      const baseLabel = button.dataset.label || button.textContent || "";
      button.textContent = isUnlocked ? baseLabel : `${baseLabel} [未解锁]`;
    }
  });

  // 3. Update Dialogue Panel
  const diagPanel = document.getElementById("dialogue-panel");
  if (diagPanel) {
    const showDiag = state.orderFlow === "guest_enter" || state.orderFlow === "dialogue" || state.orderFlow === "mixing";
    
    if (showDiag) {
      (diagPanel as HTMLElement).style.display = "block";
      
      const nameEl = document.getElementById("guest-name");
      const titleEl = document.getElementById("guest-title");
      const textEl = document.getElementById("guest-dialogue");
      const colorEl = document.getElementById("guest-avatar-color");
      const optionsContainer = document.getElementById("dialogue-options");
      const nextBtn = document.getElementById("btn-next");

      const guest = state.currentGuestId ? GuestsDB[state.currentGuestId] : null;
      if (nameEl) nameEl.textContent = guest ? guest.name : "UNKNOWN";
      if (titleEl) titleEl.textContent = guest ? guest.title : "???";
      if (colorEl) colorEl.style.backgroundColor = getGuestAccentColor(state.currentGuestId);

      if (state.orderFlow === "guest_enter") {
        // We are in interactive dialogue mode
        if (state.currentDialogueNode) {
          if (textEl) textEl.textContent = state.currentDialogueNode.text;
          
          // Render options
          if (optionsContainer) {
            optionsContainer.innerHTML = "";
            state.currentDialogueNode.options.forEach((opt, idx) => {
              const btn = document.createElement("button");
              btn.className = "dialogue-option-btn w-full text-left bg-[#1a0f1e]/80 border border-[#73f2ff]/30 text-[#73f2ff] py-2 px-4 hover:bg-[#73f2ff]/20 hover:border-[#73f2ff] transition-all cursor-pointer font-light tracking-wide rounded";
              btn.setAttribute("data-option-index", idx.toString());
              btn.innerHTML = `<span class="opacity-50 mr-2">></span> ${opt.text}`;
              optionsContainer.appendChild(btn);
            });
          }
          if (nextBtn) (nextBtn as HTMLElement).style.display = "none";
        } else {
          // Fallback to simple dialogue if no node is present
          const fallbackLine = state.currentDialogue || guest?.dialogues.enter?.[0] || "...";
          if (textEl) textEl.textContent = fallbackLine;
          if (optionsContainer) optionsContainer.innerHTML = "";
          if (nextBtn) {
            (nextBtn as HTMLElement).style.display = "inline-block";
            nextBtn.textContent = "开始调酒";
          }
        }
      } else {
        // In mixing mode, show the order request
        if (textEl) {
          const moodText = getEventDescription(state.activeEvent);
          textEl.textContent = `[需求] ${moodText}`;
        }
        if (optionsContainer) optionsContainer.innerHTML = "";
        if (nextBtn) (nextBtn as HTMLElement).style.display = "none";
      }
    } else {
      (diagPanel as HTMLElement).style.display = "none";
    }
  }

  // 4. Update Result/Central Panel
  const resPanel = document.getElementById("result-panel");
  if (resPanel) {
    const showRes = state.orderFlow === "idle" || state.orderFlow === "result" || state.orderFlow === "resource_settlement" || state.orderFlow === "game_over";
    resPanel.style.display = showRes ? "block" : "none";

    if (showRes) {
      const titleEl = document.getElementById("result-title");
      const scoreEl = document.getElementById("result-score");
      const descEl = document.getElementById("result-desc");
      const nextBtn = document.getElementById("btn-result-next");

      if (state.orderFlow === "idle") {
        if (titleEl) titleEl.textContent = "共振酒吧 (Cyber Resonance)";
        if (scoreEl) scoreEl.textContent = "酒吧里很安静...";
        if (descEl) descEl.textContent = "点击下方按钮开始营业";
        if (nextBtn) nextBtn.textContent = "开始第 " + state.day + " 天";
      } else if (state.orderFlow === "result") {
        if (titleEl) titleEl.textContent = "上酒完成";
        if (scoreEl) {
          const breakdown = state.lastScoreBreakdown;
          scoreEl.innerHTML = `匹配度: <strong style="color:#ff73a8; font-size:1.5em;">${state.lastScore.toFixed(0)}%</strong><br/>
            ${breakdown ? `形状 ${breakdown.shape} / 振幅 ${breakdown.amplitude} / 周期 ${breakdown.period} / 相位 ${breakdown.phase} / 边缘 ${breakdown.edge} / 毛刺 ${breakdown.noise}` : ""}`;
        }

        let feedback = "";
        if (state.lastScore >= 95) feedback = "完美共振！";
        else if (state.lastScore >= 80) feedback = "客人很满意。";
        else if (state.lastScore >= 60) feedback = "勉强可以接受。";
        else feedback = "客人非常失望...";
        if (descEl) descEl.textContent = feedback;
        if (nextBtn) nextBtn.textContent = "下一位客人";
      } else if (state.orderFlow === "resource_settlement") {
        if (titleEl) titleEl.textContent = "第 " + state.day + " 天结算";
        if (scoreEl) {
          scoreEl.innerHTML = `
            今日收入: $${state.dailyLedger.orderIncomeToday.toFixed(1)}<br/>
            今日耗材: -$${state.dailyLedger.ingredientCostToday.toFixed(1)}<br/>
            今日租金: -$${state.dailyLedger.rentToday.toFixed(1)}
          `;
        }
        if (descEl) {
          const net = state.dailyLedger.orderIncomeToday - state.dailyLedger.ingredientCostToday - state.dailyLedger.rentToday;
          descEl.textContent = `日结净收益：$${net.toFixed(1)}`;
        }
        if (nextBtn) nextBtn.textContent = "开始新的一天";
      } else if (state.orderFlow === "game_over") {
        if (titleEl) titleEl.textContent = "营业结束";
        if (scoreEl) scoreEl.textContent = "任一核心资源归零，本局结束。";
        if (descEl) descEl.textContent = "建议复盘：减少低分单、控制冰块与耗材成本。";
        if (nextBtn) nextBtn.textContent = "重新开始";
      }
    }
  }

  // 5. Update archive modal visibility and content
  const overlay = document.getElementById("archive-overlay");
  if (overlay) {
    if (isArchiveOpen) {
      overlay.style.display = "flex";
      renderArchive(state);
    } else {
      overlay.style.display = "none";
    }
  }
}

function renderArchive(state: GameState) {
  const content = document.getElementById("archive-content");
  if (!content) return;

  const archiveHtml = `
    <h2 class="archive-title" style="margin-bottom: 20px; text-align: center;">酒吧档案室 (GUEST ARCHIVES)</h2>
    ${Object.values(GuestsDB).map(guest => {
    const affinity = state.guestAffinity[guest.id] || 0;
    const isMet = (state.guestAffinity[guest.id] !== undefined) || state.currentGuestId === guest.id;

    if (!isMet) {
      return `
          <div style="border: 1px solid #333; padding: 15px; margin-bottom: 20px; background: rgba(0,0,0,0.5);">
            <div style="color: #666; font-size: 1.2em; font-style: italic;">[未接触的客人]</div>
          </div>
        `;
    }

    const memoryFragments = guest.archives.map(entry => {
      const isUnlocked = affinity >= entry.threshold;
      if (isUnlocked) {
        return `
            <div class="archive-entry unlocked" style="margin-bottom: 10px; padding: 10px; border-left: 4px solid #73f2ff; background: rgba(115, 242, 255, 0.05);">
              <div class="archive-entry-title" style="color: #73f2ff; font-weight: bold; margin-bottom: 5px;">>> ${entry.title}</div>
              <div class="archive-entry-content" style="color: #ddd;">${entry.content}</div>
            </div>
          `;
      } else {
        return `
            <div class="archive-entry locked" style="margin-bottom: 10px; padding: 10px; border-left: 4px solid #555; background: rgba(255, 255, 255, 0.05); opacity: 0.6;">
              <div class="archive-entry-title" style="color: #999; font-style: italic;">>> [锁定]</div>
              <div class="archive-entry-content" style="color: #777;">需要好感度达到 ${entry.threshold} 以解锁...</div>
            </div>
          `;
      }
    }).join('');

    return `
        <div style="border: 1px solid #73f2ff; padding: 15px; margin-bottom: 30px; background: rgba(20,20,30,0.8);">
          <div style="font-size: 1.5em; color: #ff73a8; font-weight: bold;">${guest.name} <span style="font-size: 0.6em; color: #73f2ff; font-weight: normal;">| ${guest.title}</span></div>
          <div style="color: #ccc; margin: 10px 0;">${guest.bio}</div>
          <div style="margin-bottom: 5px;">好感度: ${affinity}/100</div>
          <div class="affinity-bar-container">
            <div class="affinity-bar-fill" style="width: ${Math.min(100, Math.max(0, affinity))}%"></div>
          </div>
          <h4 style="color:#ff73a8; margin: 15px 0 10px; border-bottom:1px solid rgba(255,115,168,0.3);">记忆碎片 MEMORIES</h4>
          ${memoryFragments}
        </div>
      `;
  }).join('')}
  `;

  content.innerHTML = archiveHtml;
}
