import type { GameState } from "../game/game-state";
import { generateWave, drinkStateToWaveParams } from "../systems/wave/wave-generator";
import { NPC_SPRITES, COLOR_MAP, PROP_SPRITES } from "./pixel-assets";
import { getEventDescription } from "../systems/event/event-system";

export function renderBar(ctx: CanvasRenderingContext2D, width: number, height: number, state: GameState) {
  // Clear screen
  ctx.clearRect(0, 0, width, height);

  if (state.orderFlow === "mixing_view") {
    drawMixingFocusView(ctx, width, height, state);
    return;
  }

  // 1. Draw Background (Cyberpunk Cityscape & Wall)
  drawCyberpunkBackground(ctx, width, height);

  // ... (rest of the existing renderBar logic)
  if (["guest_enter", "dialogue", "mixing", "result"].includes(state.orderFlow)) {
    // 2. Draw High-Res Bar Shelf (Liquor Cabinet)
    drawHighResBarShelf(ctx, width, height);

    // 3. Draw L-Shape Bar Counter
    drawLShapeTable(ctx, width, height);

    // 4. Draw NPC (on the LEFT side, inside the L-shape corner)
    if (state.currentGuestId) {
      const npcX = width * 0.12;
      const npcY = height - 420;
      drawNPC(ctx, npcX, npcY, 280, state.currentGuestId);
    }

    // 5. Draw Cup (Only if base spirit is selected, and FLOAT above table)
    if (state.drink.baseSpirit !== null) {
      const cupX = width * 0.7;
      const floatingOffset = 25 + Math.sin(Date.now() / 400) * 8;
      const cupY = height - 130 - floatingOffset;
      const cupWidth = 80;
      const cupHeight = 120;
      drawPixelCup(ctx, cupX, cupY, cupWidth, cupHeight, state.drink);

      // Shadow for floating cup
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.ellipse(cupX, height - 130, 35, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Draw Oscilloscope Area
    const waveAreaY = 120;
    const waveAreaWidth = width * 0.5;
    const waveAreaX = (width - waveAreaWidth) / 2;
    const waveAreaHeight = 120;
    drawOscilloscope(ctx, waveAreaX, waveAreaY, waveAreaWidth, waveAreaHeight);

    // Waves...
    if (state.currentOrder) {
      const targetWave = generateWave(state.currentOrder.targetParams);
      drawWave(ctx, waveAreaX, waveAreaY, waveAreaWidth, waveAreaHeight, targetWave, "rgba(255, 125, 175, 0.9)", 2, true);
    }
    if (state.drink.baseSpirit) {
      const currentParams = drinkStateToWaveParams(state.drink);
      const currentWave = generateWave(currentParams);
      drawWave(ctx, waveAreaX, waveAreaY, waveAreaWidth, waveAreaHeight, currentWave, "rgba(95, 240, 255, 1)", 3.5, false);
    }
  }
}

function drawMixingFocusView(ctx: CanvasRenderingContext2D, w: number, h: number, state: GameState) {
  // Dark focus background
  ctx.fillStyle = "#0f0f1a";
  ctx.fillRect(0, 0, w, h);

  // Wall Texture (Faint)
  ctx.strokeStyle = "rgba(255, 45, 125, 0.02)";
  for (let i = 0; i < w; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, h);
    ctx.stroke();
  }

  // Large Table
  const tableY = h - 300; // Moved table up slightly to fit bigger props inside
  const tableHeight = 300;
  ctx.fillStyle = "#1a0a1a";
  ctx.fillRect(0, tableY, w, tableHeight);
  ctx.strokeStyle = "#ff2d7d";
  ctx.lineWidth = 4;
  ctx.strokeRect(-10, tableY, w + 20, 10);

  // Layout positions - Props are now placed INSIDE the table (y > tableY)
  const propY = tableY + 60;

  // Left: Spirits (Made LARGER: scale 50 -> 80)
  drawSpiritsSet(ctx, 60, propY - 40, state);

  // Middle: Ice Box
  drawIceBox(ctx, w / 2 - 300, propY + 20);

  // Middle: Cup (Smaller and floating inside table area)
  const cupX = w / 2;
  const cupY = tableY + 180;
  drawPixelCup(ctx, cupX, cupY, 80, 120, state.drink);

  // Right: Additives
  drawAdditivesSet(ctx, w - 620, propY - 20, state);

  // Right: Stir tools (CW / CCW)
  drawStirTools(ctx, w / 2 + 70, propY + 60, state);

  // Right: Advanced Tools (Second row)
  drawAdvancedTools(ctx, w - 380, propY + 100, state);

  // Top: Oscilloscope (Moved to center of viewport)
  const waveAreaWidth = w * 0.85; // Slightly wider
  const waveAreaX = (w - waveAreaWidth) / 2;
  const waveAreaHeight = 320; // Taller to prevent overflow
  const waveAreaY = (h - waveAreaHeight) / 2 - 80; // Centered in viewport, slightly offset up for table

  // Show order requirements
  if (state.currentOrder) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "italic 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`“${state.currentOrder.moodText}”`, w / 2, waveAreaY - 20);
    ctx.textAlign = "left";
  }

  // Show event if active
  if (state.activeEvent) {
    ctx.fillStyle = "#ff2d7d";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(getEventDescription(state.activeEvent), w / 2, waveAreaY - 45);
    ctx.textAlign = "left";
  }

  drawOscilloscope(ctx, waveAreaX, waveAreaY, waveAreaWidth, waveAreaHeight);
  if (state.currentOrder) {
    const targetWave = generateWave(state.currentOrder.targetParams);
    drawWave(ctx, waveAreaX, waveAreaY, waveAreaWidth, waveAreaHeight, targetWave, "rgba(255, 125, 175, 0.9)", 2, true);
    
    // Draw realtime hints
    if (state.drink.baseSpirit) {
      const tp = state.currentOrder.targetParams as any;
      const cp = state.drink;
      
      let hint = "";
      if (cp.baseWaveShape !== tp.baseShape) hint = "基础波形错误，请重做并选择正确的基酒";
      else if (Math.abs(cp.amplitude - tp.amplitude) > 10) hint = cp.amplitude < tp.amplitude ? "振幅偏低，建议加糖浆" : "振幅偏高，建议加冰块";
      else if (Math.abs(cp.periodLevel - tp.periodLevel) > 1) hint = cp.periodLevel < tp.periodLevel ? "周期偏短，建议用捣拌棒" : "周期偏长，建议加糖浆";
      else if (Math.abs(cp.phaseStep - tp.phaseStep) > 1) hint = "相位不齐，建议顺/逆时针搅拌";
      else if (cp.noiseLevel - tp.noiseLevel > 10 || cp.edgeSharpness - tp.edgeSharpness > 10) hint = "边缘或锯齿过重，建议使用量杯平滑";
      else if (tp.noiseLevel - cp.noiseLevel > 10) hint = "毛刺不足，建议加苏打水";
      else if (tp.edgeSharpness - cp.edgeSharpness > 10) hint = "偏斜不足，建议加柠檬";
      else if (tp.harmonics - cp.harmonics > 10) hint = "谐波不足，建议使用摇壶";
      else if (cp.decay - tp.decay > 10) hint = "拖尾衰减过快，建议使用喷枪";
      
      if (hint) {
        ctx.fillStyle = "rgba(115, 242, 255, 0.9)";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`[提示] ${hint}`, w / 2, waveAreaY + waveAreaHeight + 20);
        ctx.textAlign = "left";
      }
    }
  }
  if (state.drink.baseSpirit) {
    const currentParams = drinkStateToWaveParams(state.drink);
    const currentWave = generateWave(currentParams);
    drawWave(ctx, waveAreaX, waveAreaY, waveAreaWidth, waveAreaHeight, currentWave, "rgba(95, 240, 255, 1)", 3.5, false);
  }

  // Dragging Feedback
  if (state.draggedItem) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    drawDraggedPreview(ctx, state.mouse.x, state.mouse.y, state.draggedItem);
    ctx.restore();
  }
}

function drawPixelSprite(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, spriteData: string[]) {
  const numRows = spriteData.length;
  const numCols = spriteData[0].length;
  const pixelSize = width / numCols;

  ctx.save();
  ctx.translate(x, y);

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const char = spriteData[r][c];
      const color = COLOR_MAP[char];
      if (color && color !== "transparent") {
        ctx.fillStyle = color;
        // overlap slightly to avoid bleeding lines
        ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize + 0.5, pixelSize + 0.5);
      }
    }
  }
  ctx.restore();
}

function drawSpiritsSet(ctx: CanvasRenderingContext2D, x: number, y: number, state: GameState) {
  // Vodka - Increased size to 80
  drawPixelSprite(ctx, x, y, 80, PROP_SPRITES["vodka_bottle"]);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Arial";
  ctx.fillText("伏特加", x + 15, y - 10);

  // Gin - Increased size to 80
  drawPixelSprite(ctx, x + 120, y, 80, PROP_SPRITES["gin_bottle"]);
  ctx.fillStyle = "#fff";
  ctx.fillText("金酒", x + 145, y - 10);

  // Whisky - Increased size to 80
  drawPixelSprite(ctx, x + 240, y, 80, PROP_SPRITES["whisky_bottle"]);
  ctx.fillStyle = "#fff";
  ctx.fillText("威士忌", x + 250, y - 10);

  drawPixelSprite(ctx, x + 360, y, 80, PROP_SPRITES["rum_bottle"]);
  ctx.fillStyle = "#fff";
  ctx.fillText("朗姆", x + 385, y - 10);
  if (!state.inventory.includes("rum")) {
    drawLockedOverlay(ctx, x + 360, y, 80, 80);
  }
}

function drawIceBox(ctx: CanvasRenderingContext2D, x: number, y: number) {
  drawPixelSprite(ctx, x, y, 100, PROP_SPRITES["ice_bowl"]);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Arial";
  ctx.fillText("冰块", x + 35, y + 120);
}

function drawAdditivesSet(ctx: CanvasRenderingContext2D, x: number, y: number, state: GameState) {
  // Syrup
  drawPixelSprite(ctx, x, y, 60, PROP_SPRITES["syrup_bottle"]);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Arial";
  ctx.fillText("糖浆", x + 5, y - 10);

  // Lemon
  drawPixelSprite(ctx, x + 120, y + 40, 60, PROP_SPRITES["lemon_slice"]);
  ctx.fillStyle = "#fff";
  ctx.fillText("柠檬", x + 120, y - 10);

  // Soda
  drawPixelSprite(ctx, x + 240, y, 60, PROP_SPRITES["soda_can"]);
  ctx.fillStyle = "#fff";
  ctx.fillText("苏打水", x + 250, y - 10);

  // Frequency reducer (Day 1)
  drawPixelSprite(ctx, x + 340, y, 60, PROP_SPRITES["tonic_vial"]);
  ctx.fillStyle = "#fff";
  ctx.fillText("捣拌棒", x + 345, y - 10);

  drawPixelSprite(ctx, x + 440, y, 60, PROP_SPRITES["bitters_bottle"]);
  ctx.fillStyle = "#fff";
  ctx.fillText("苦精", x + 450, y - 10);
  if (!state.inventory.includes("bitters")) {
    drawLockedOverlay(ctx, x + 440, y, 60, 60);
  }
}

function drawStirTools(ctx: CanvasRenderingContext2D, x: number, y: number, state: GameState) {
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 70, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 90, y);
  ctx.lineTo(x + 160, y);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.fillText("顺搅", x + 20, y + 20);
  ctx.fillText("逆搅", x + 110, y + 20);
  if (!state.inventory.includes("stir_tool")) {
    drawLockedOverlay(ctx, x, y - 30, 180, 50);
  }
}

function drawAdvancedTools(ctx: CanvasRenderingContext2D, x: number, y: number, state: GameState) {
  drawPixelSprite(ctx, x, y, 56, PROP_SPRITES["shaker"]);
  ctx.fillStyle = "#fff";
  ctx.fillText("摇壶", x + 12, y - 8);
  if (!state.inventory.includes("shake_tool")) {
    drawLockedOverlay(ctx, x, y, 56, 56);
  }

  drawPixelSprite(ctx, x + 90, y, 56, PROP_SPRITES["dropper"]);
  ctx.fillStyle = "#fff";
  ctx.fillText("量杯", x + 76, y - 8);
  if (!state.inventory.includes("measure_cup")) {
    drawLockedOverlay(ctx, x + 90, y, 56, 56);
  }

  // Placeholder for flame_tool
  drawPixelSprite(ctx, x + 180, y, 56, PROP_SPRITES["shaker"]); // Use shaker as placeholder
  ctx.fillStyle = "#fff";
  ctx.fillText("喷枪", x + 175, y - 8);
  if (!state.inventory.includes("flame_tool")) {
    drawLockedOverlay(ctx, x + 180, y, 56, 56);
  }
}

function drawDraggedPreview(ctx: CanvasRenderingContext2D, x: number, y: number, item: string) {
  ctx.save();

  // Center the item on mouse and add a slight "grabbed" tilt
  ctx.translate(x, y);
  ctx.rotate(0.05); // Subtle tilt

  if (item === "select_vodka") {
    drawPixelSprite(ctx, -25, -50, 50, PROP_SPRITES["vodka_bottle"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("伏特加", 0, 40);
  } else if (item === "select_gin") {
    drawPixelSprite(ctx, -25, -50, 50, PROP_SPRITES["gin_bottle"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("金酒", 0, 40);
  } else if (item === "select_whisky") {
    drawPixelSprite(ctx, -25, -50, 50, PROP_SPRITES["whisky_bottle"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("威士忌", 0, 40);
  } else if (item === "select_rum") {
    drawPixelSprite(ctx, -25, -50, 50, PROP_SPRITES["rum_bottle"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("朗姆", 0, 40);
  } else if (item === "add_ice") {
    drawPixelSprite(ctx, -15, -15, 30, PROP_SPRITES["ice_cube"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("冰块", 0, 25);
  } else if (item === "add_syrup") {
    drawPixelSprite(ctx, -20, -40, 40, PROP_SPRITES["syrup_bottle"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("糖浆", 0, 35);
  } else if (item === "add_lemon") {
    drawPixelSprite(ctx, -20, -20, 40, PROP_SPRITES["lemon_slice"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("柠檬", 0, 30);
  } else if (item === "add_soda") {
    drawPixelSprite(ctx, -20, -40, 40, PROP_SPRITES["soda_can"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("苏打水", 0, 35);
  } else if (item === "add_tonic") {
    drawPixelSprite(ctx, -20, -40, 40, PROP_SPRITES["tonic_vial"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("捣拌棒", -10, 35);
  } else if (item === "add_bitters") {
    drawPixelSprite(ctx, -20, -40, 40, PROP_SPRITES["bitters_bottle"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("苦精", 0, 35);
  } else if (item === "stir" || item === "stir_cw") {
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-60, 0);
    ctx.lineTo(60, 0);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillText("顺时针", -20, 20);
  } else if (item === "stir_ccw") {
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-60, 0);
    ctx.lineTo(60, 0);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillText("逆时针", -20, 20);
  } else if (item === "shake") {
    drawPixelSprite(ctx, -24, -24, 48, PROP_SPRITES["shaker"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("摇壶", -10, 30);
  } else if (item === "measure_cup") {
    drawPixelSprite(ctx, -24, -24, 48, PROP_SPRITES["dropper"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("量杯", -10, 30);
  } else if (item === "flame") {
    drawPixelSprite(ctx, -24, -24, 48, PROP_SPRITES["shaker"]);
    ctx.fillStyle = "#fff";
    ctx.fillText("喷枪", -10, 30);
  }

  ctx.restore();
}

function drawCyberpunkBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Base dark background
  ctx.fillStyle = "#0d0d1a";
  ctx.fillRect(0, 0, w, h);

  // Draw a "Window" to the city on the left
  const winX = 50;
  const winY = 40;
  const winW = w * 0.35;
  const winH = h * 0.45;

  ctx.fillStyle = "#05050a";
  ctx.fillRect(winX, winY, winW, winH);

  // City Skyline
  const bldgWidth = 30;
  let seed = 12345;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let x = winX; x < winX + winW; x += bldgWidth + 8) {
    const bH = 60 + pseudoRandom() * 140;
    ctx.fillStyle = "#151525";
    ctx.fillRect(x, winY + winH - bH, bldgWidth, bH);

    // Building windows
    for (let wy = winY + winH - bH + 8; wy < winY + winH - 8; wy += 15) {
      if (pseudoRandom() > 0.6) {
        ctx.fillStyle = pseudoRandom() > 0.5 ? "#ffffcc" : "#ff00ff";
        ctx.fillRect(x + 4, wy, 4, 4);
      }
      if (pseudoRandom() > 0.6) {
        ctx.fillStyle = pseudoRandom() > 0.5 ? "#ffffcc" : "#00ffff";
        ctx.fillRect(x + 20, wy, 4, 4);
      }
    }
  }

  // Window frame
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 12;
  ctx.strokeRect(winX, winY, winW, winH);

  // Wall texture (Retro Wallpaper style like the ref image)
  ctx.strokeStyle = "rgba(255, 45, 125, 0.03)";
  ctx.lineWidth = 1;
  for (let x = winX + winW + 20; x < w; x += 30) {
    for (let y = 0; y < h * 0.6; y += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Floor Grid
  ctx.strokeStyle = "rgba(115, 242, 255, 0.04)";
  const gridSize = 50;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.6);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = h * 0.6; y < h; y += 25) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawLShapeTable(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const tableTopY = h - 130;
  const lWidth = w * 0.4; // Width of the L-corner part

  ctx.save();

  // Horizontal part (Main counter)
  ctx.fillStyle = "#2a1a2e";
  ctx.fillRect(0, tableTopY, w, 130);

  // L-Corner Perspective Part (The "L" shape wrapping the NPC)
  ctx.fillStyle = "#3a2a3e";
  ctx.beginPath();
  ctx.moveTo(lWidth, tableTopY);
  ctx.lineTo(lWidth + 100, tableTopY - 60); // Perspective corner
  ctx.lineTo(0, tableTopY - 60);
  ctx.lineTo(0, tableTopY);
  ctx.closePath();
  ctx.fill();

  // Table edge neon
  ctx.strokeStyle = "#ff2d7d";
  ctx.lineWidth = 4;
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#ff2d7d";

  // Main horizontal edge
  ctx.beginPath();
  ctx.moveTo(0, tableTopY);
  ctx.lineTo(w, tableTopY);
  ctx.stroke();

  // Perspective edge
  ctx.beginPath();
  ctx.moveTo(0, tableTopY - 60);
  ctx.lineTo(lWidth + 100, tableTopY - 60);
  ctx.lineTo(lWidth, tableTopY);
  ctx.stroke();

  ctx.restore();
}

function drawHighResBarShelf(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const shelfX = w * 0.4;
  const shelfY = 40;
  const shelfW = w * 0.55;
  const shelfH = h * 0.6;

  // Background wall pattern
  ctx.fillStyle = "#1a0a1a";
  ctx.fillRect(shelfX, shelfY, shelfW, shelfH);

  // Detailed Shelf Structure (128-res like detail)
  ctx.fillStyle = "#2a1a2e";
  for (let i = 0; i < 4; i++) {
    const y = shelfY + 80 + i * 110;
    // Shelf wood
    ctx.fillRect(shelfX - 20, y, shelfW + 40, 15);

    // Detailed bottles
    for (let bx = shelfX + 30; bx < shelfX + shelfW - 30; bx += 25) {
      const seed = (i * 100) + bx;
      if (Math.sin(seed) > -0.2) {
        const bH = 40 + Math.abs(Math.cos(seed)) * 30;
        const bW = 12 + Math.abs(Math.sin(seed * 2)) * 8;

        // Bottle body
        const hue = Math.abs(Math.sin(seed * 3)) * 360;
        ctx.fillStyle = `hsla(${hue}, 60%, 40%, 0.9)`;
        ctx.fillRect(bx, y - bH, bW, bH);

        // Label
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(bx + 2, y - bH + 10, bW - 4, 15);

        // Neck
        ctx.fillStyle = `hsla(${hue}, 60%, 20%, 0.9)`;
        ctx.fillRect(bx + bW / 4, y - bH - 10, bW / 2, 10);
      }
    }
  }

  // Vertical supports
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(shelfX + 10, shelfY, 10, shelfH);
  ctx.fillRect(shelfX + shelfW - 20, shelfY, 10, shelfH);
}

function drawNPC(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, guestId: string) {
  const sprite = NPC_SPRITES[guestId];
  if (!sprite) return;

  const rows = sprite.length;
  const cols = sprite[0].length;
  const pixelSize = size / cols;

  ctx.save();
  // 更细腻的呼吸动画
  const hover = Math.sin(Date.now() / 1200) * 5;
  ctx.translate(x, y + hover);

  // 角色背部环境光 (Rim Light)
  ctx.shadowBlur = 30;
  ctx.shadowColor = "rgba(255, 45, 125, 0.2)";

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorChar = sprite[row][col];
      const color = COLOR_MAP[colorChar];
      if (color !== "transparent") {
        ctx.fillStyle = color;
        // 渲染像素点，略微重叠以消除缝隙
        ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize + 0.5, pixelSize + 0.5);

        // 眼睛/发光部位增强
        if (["W", "Y", "C", "p"].includes(colorChar)) {
          ctx.globalAlpha = 0.3;
          ctx.shadowBlur = 8;
          ctx.shadowColor = color;
          ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
          ctx.globalAlpha = 1.0;
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  // 底部阴影
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(size / 2, rows * pixelSize, size * 0.4, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawTable(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const tableTopY = h - 120;
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, tableTopY, w, 120);

  // Table edge neon
  ctx.strokeStyle = "#73f2ff";
  ctx.lineWidth = 4;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#73f2ff";
  ctx.beginPath();
  ctx.moveTo(0, tableTopY);
  ctx.lineTo(w, tableTopY);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

export function drawPixelCup(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, drink: any) {
  const topWidth = width;
  const bottomWidth = width * 0.7; // Tapered bottom
  const halfTop = topWidth / 2;
  const halfBottom = bottomWidth / 2;

  ctx.save();
  ctx.translate(x, y);

  // 1. Draw Liquid (Inside Trapezoid)
  if (drink.volume > 0) {
    const renderVolume = Math.min(drink.volume, 200);
    const liquidHeight = (renderVolume / 200) * (height - 10);
    const liquidTopY = -liquidHeight;

    // Calculate liquid top width based on taper
    const liquidTopWidth = bottomWidth + (topWidth - bottomWidth) * (renderVolume / 200);
    const halfLiquidTop = liquidTopWidth / 2;

    ctx.fillStyle = drink.color || "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.moveTo(-halfBottom, 0);
    ctx.lineTo(halfBottom, 0);
    ctx.lineTo(halfLiquidTop, liquidTopY);
    ctx.lineTo(-halfLiquidTop, liquidTopY);
    ctx.closePath();
    ctx.fill();

    // Liquid surface shine
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-halfLiquidTop, liquidTopY);
    ctx.lineTo(halfLiquidTop, liquidTopY);
    ctx.stroke();
  }

  // 2. Draw Cup Outline (Trapezoid)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-halfTop, -height);
  ctx.lineTo(-halfBottom, 0);
  ctx.lineTo(halfBottom, 0);
  ctx.lineTo(halfTop, -height);
  // Do not close path to leave top open
  ctx.stroke();

  // Cup bottom thickness
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-halfBottom, 0);
  ctx.lineTo(halfBottom, 0);
  ctx.stroke();

  // Glass reflections
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-halfTop + 10, -height + 10);
  ctx.lineTo(-halfBottom + 5, -5);
  ctx.stroke();

  ctx.restore();
}

// 辅助函数：调整颜色亮度
function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.floor(R * (100 + percent) / 100);
  G = Math.floor(G * (100 + percent) / 100);
  B = Math.floor(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
  const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
  const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

  return "#" + RR + GG + BB;
}

function drawOscilloscope(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Outer frame
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(x, y - h / 2, w, h);
  ctx.strokeStyle = "#73f2ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y - h / 2, w, h);

  // Scanlines
  ctx.strokeStyle = "rgba(115, 242, 255, 0.15)";
  for (let sy = y - h / 2; sy < y + h / 2; sy += 6) {
    ctx.beginPath();
    ctx.moveTo(x, sy);
    ctx.lineTo(x + w, sy);
    ctx.stroke();
  }
}

function drawWave(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, data: number[], color: string, lineWidth: number, isDashed: boolean) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  if (isDashed) ctx.setLineDash([8, 8]);

  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.beginPath();

  for (let i = 0; i < data.length; i++) {
    const px = x + (i / (data.length - 1)) * w;
    const py = y + (data[i] * h / 2.2) * -1;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.stroke();
  ctx.restore();
}

function drawLockedOverlay(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = "rgba(12, 12, 16, 0.55)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "bold 12px Arial";
  ctx.fillText("未解锁", x + 8, y + h / 2 + 4);
  ctx.restore();
}

function getLiquidColor(spirit: string | null): string {
  switch (spirit) {
    case "vodka": return "#c8f0ff";
    case "gin": return "#b4ffb4";
    case "whisky": return "#c89632";
    default: return "#ffffff";
  }
}
