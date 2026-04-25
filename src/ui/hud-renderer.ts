import type { GameState } from "../game/game-state";
import { GuestsDB } from "../content/guests";

type Dispatch = (actionType: any) => void;

let isInitialized = false;
let lastState: GameState | null = null;

export function renderHud(state: GameState, dispatch: Dispatch) {
  lastState = state;
  const uiLayer = document.getElementById("ui-layer");
  if (!uiLayer) return;

  if (!isInitialized) {
    uiLayer.innerHTML = `
      <div id="status-panel" class="panel">
        <h3 style="margin:0 0 10px 0;">共振酒吧 (Cyber Resonance)</h3>
        <div id="status-text"></div>
      </div>
      <div id="actions-panel" class="panel">
        <h4 style="margin:0 0 10px 0; color:#ff73a8; font-family:'Courier New', Courier, monospace;">基酒 SPIRITS</h4>
        <button class="btn" id="btn-vodka" data-action="select_vodka">伏特加</button>
        <button class="btn" id="btn-gin" data-action="select_gin">琴酒</button>
        <button class="btn" id="btn-whisky" data-action="select_whisky">威士忌</button>
        
        <h4 style="margin:10px 0; color:#ff73a8; font-family:'Courier New', Courier, monospace;">添加剂 ADDITIVES</h4>
        <button class="btn" data-action="add_syrup">糖浆 (频率+)</button>
        <button class="btn" data-action="add_lemon">柠檬 (酸度+)</button>
        <button class="btn" data-action="add_ice">冰块 (温度-)</button>
        <button class="btn" data-action="add_soda">苏打 (气泡+)</button>
        <button class="btn" data-action="stir">搅拌</button>
        
        <hr style="border-color:#73f2ff; margin: 10px 0; opacity: 0.3;">
        <button class="btn" data-action="reset">重做</button>
        <button class="btn" id="btn-submit" data-action="submit" style="border-color:#ff73a8; color:#ff73a8;">提交上酒</button>
      </div>
      <div id="dialogue-panel" class="panel" style="display:none;">
        <div id="guest-name" style="font-weight:bold; color:#ff73a8; margin-bottom:8px; border-bottom: 1px solid rgba(255,115,168,0.3);"></div>
        <div id="guest-dialogue" style="font-size:1.1em; line-height:1.4; min-height: 3em;"></div>
        <button class="btn" id="btn-next" style="margin-top:10px;">接受订单</button>
      </div>
      <div id="result-panel" class="panel" style="display:none; min-width:320px; text-align:center;">
        <h2 id="result-title" style="margin-top:0; color:#73f2ff;"></h2>
        <div id="result-score" style="margin:20px 0;"></div>
        <div id="result-desc" style="margin-bottom:20px; font-style:italic; color:#aaa;"></div>
        <button class="btn" id="btn-result-next" style="width:100%; padding: 12px;">继续</button>
      </div>
    `;

    uiLayer.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (!lastState) return;

      if (target.matches(".btn[data-action]")) {
        const action = target.getAttribute("data-action");
        dispatch(action);
      }
      if (target.id === "btn-next") {
        dispatch("take_order");
      }
      if (target.id === "btn-result-next") {
        const flow = lastState.orderFlow;
        if (flow === "idle") dispatch("next_guest");
        else if (flow === "result") dispatch("next_guest");
        else if (flow === "resource_settlement") dispatch("next_day");
        else if (flow === "game_over") dispatch("restart");
      }
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
      今日冰耗电: ${state.dailyLedger.powerFromIceToday.toFixed(1)}<br/>
      <hr style="border-color:#73f2ff; margin: 8px 0; opacity: 0.2;">
      容量: ${state.drink.volume}ml | 温度: ${state.drink.temperature}°C
    `;
  }

  // 2. Update Actions Panel (Mixing buttons)
  const isMixing = state.orderFlow === "mixing" || state.orderFlow === "guest_enter" || state.orderFlow === "mixing_view";
  const actionsPanel = document.getElementById("actions-panel");
  if (actionsPanel) {
    // Hide original buttons in focused mixing view as we use drag and drop
    const spiritGroup = actionsPanel.querySelectorAll("button[data-action^='select_'], button[data-action^='add_'], button[data-action='stir']");
    spiritGroup.forEach(btn => {
      (btn as HTMLElement).style.display = state.orderFlow === "mixing_view" ? "none" : "inline-block";
    });
    
    // Also hide the headers if in mixing_view
    const headers = actionsPanel.querySelectorAll("h4");
    headers.forEach(h => {
      (h as HTMLElement).style.display = state.orderFlow === "mixing_view" ? "none" : "block";
    });
  }

  document.querySelectorAll("#actions-panel .btn").forEach((btn) => {
    const action = btn.getAttribute("data-action");
    if (action === "submit") {
      (btn as HTMLButtonElement).disabled = !isMixing || state.drink.volume === 0;
    } else if (action === "reset") {
      (btn as HTMLButtonElement).disabled = !isMixing;
    } else if (action && action.startsWith("select_")) {
      (btn as HTMLButtonElement).disabled = !isMixing || state.drink.baseSpirit !== null;
    } else {
      (btn as HTMLButtonElement).disabled = !isMixing;
    }
  });

  // 3. Update Dialogue Panel
  const diagPanel = document.getElementById("dialogue-panel");
  if (diagPanel) {
    const showDiag = state.orderFlow === "guest_enter" || state.orderFlow === "dialogue" || state.orderFlow === "mixing";
    diagPanel.style.display = showDiag ? "block" : "none";
    
    if (showDiag) {
      const nameEl = document.getElementById("guest-name");
      const textEl = document.getElementById("guest-dialogue");
      const nextBtn = document.getElementById("btn-next");
      
      const guest = state.currentGuestId ? GuestsDB[state.currentGuestId] : null;
      if (nameEl) nameEl.textContent = guest ? `${guest.name} (${guest.title})` : "???";
      
      if (textEl) {
        if (state.orderFlow === "guest_enter") {
          textEl.textContent = guest ? guest.dialogues.enter[0] : "...";
        } else {
          textEl.textContent = state.currentOrder ? state.currentOrder.moodText : "What can I get you?";
        }
      }
      
      if (nextBtn) {
        nextBtn.style.display = (state.orderFlow === "guest_enter") ? "inline-block" : "none";
      }
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
        if (scoreEl) scoreEl.innerHTML = `匹配度: <strong style="color:#ff73a8; font-size:1.5em;">${state.lastScore.toFixed(0)}%</strong>`;
        
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
}
