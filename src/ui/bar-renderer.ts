import type { GameState } from "../game/game-state";
import { generateWave, drinkStateToWaveParams } from "../systems/wave/wave-generator";
import { NPC_SPRITES, COLOR_MAP } from "./pixel-assets";

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
      drawWave(ctx, waveAreaX, waveAreaY, waveAreaWidth, waveAreaHeight, targetWave, "rgba(255, 115, 168, 0.4)", 3, true);
    }
    if (state.drink.baseSpirit) {
      const currentParams = drinkStateToWaveParams(state.drink);
      const currentWave = generateWave(currentParams);
      drawWave(ctx, waveAreaX, waveAreaY, waveAreaWidth, waveAreaHeight, currentWave, "rgba(115, 242, 255, 0.9)", 3, false);
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
  const tableY = h - 250;
  ctx.fillStyle = "#1a0a1a";
  ctx.fillRect(0, tableY, w, 250);
  ctx.strokeStyle = "#ff2d7d";
  ctx.lineWidth = 4;
  ctx.strokeRect(-10, tableY, w + 20, 10);

  // Left: Spirits
  drawSpiritsSet(ctx, 50, tableY - 120);

  // Middle: Ice Box
  drawIceBox(ctx, w / 2 - 250, tableY - 60);

  // Middle: Cup
  const cupX = w / 2;
  const cupY = tableY - 40;
  drawPixelCup(ctx, cupX, cupY, 80, 120, state.drink);

  // Right: Additives
  drawAdditivesSet(ctx, w - 350, tableY - 100);
  
  // Right: Stir Tool
  drawStirTool(ctx, w / 2 + 150, tableY - 30);

  // Top: Oscilloscope (Essential for feedback)
  const waveAreaWidth = w * 0.4;
  const waveAreaX = (w - waveAreaWidth) / 2;
  const waveAreaY = 100;
  drawOscilloscope(ctx, waveAreaX, waveAreaY, waveAreaWidth, 100);
  if (state.currentOrder) {
    const targetWave = generateWave(state.currentOrder.targetParams);
    drawWave(ctx, waveAreaX, waveAreaY, waveAreaWidth, 100, targetWave, "rgba(255, 115, 168, 0.4)", 2, true);
  }
  if (state.drink.baseSpirit) {
    const currentParams = drinkStateToWaveParams(state.drink);
    const currentWave = generateWave(currentParams);
    drawWave(ctx, waveAreaX, waveAreaY, waveAreaWidth, 100, currentWave, "rgba(115, 242, 255, 0.9)", 2, false);
  }

  // Dragging Feedback
  if (state.draggedItem) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    drawDraggedPreview(ctx, state.mouse.x, state.mouse.y, state.draggedItem);
    ctx.restore();
  }
}

function drawSpiritsSet(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Vodka
  ctx.fillStyle = "#c8f0ff";
  ctx.fillRect(x, y, 40, 100);
  ctx.fillStyle = "#fff";
  ctx.fillText("VODKA", x, y - 10);
  
  // Gin
  ctx.fillStyle = "#b4ffb4";
  ctx.fillRect(x + 100, y, 40, 100);
  ctx.fillStyle = "#fff";
  ctx.fillText("GIN", x + 100, y - 10);

  // Whisky
  ctx.fillStyle = "#c89632";
  ctx.fillRect(x + 200, y, 40, 100);
  ctx.fillStyle = "#fff";
  ctx.fillText("WHISKY", x + 200, y - 10);
}

function drawIceBox(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#444466";
  ctx.fillRect(x, y, 100, 60);
  ctx.strokeStyle = "#73f2ff";
  ctx.strokeRect(x, y, 100, 60);
  
  // Little ice cubes inside
  ctx.fillStyle = "rgba(200, 240, 255, 0.6)";
  ctx.fillRect(x + 10, y + 10, 20, 20);
  ctx.fillRect(x + 40, y + 15, 20, 20);
  ctx.fillRect(x + 70, y + 10, 20, 20);
  
  ctx.fillStyle = "#fff";
  ctx.fillText("ICE", x + 35, y + 80);
}

function drawAdditivesSet(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Syrup
  ctx.fillStyle = "#ff73a8";
  ctx.fillRect(x, y, 30, 80);
  ctx.fillStyle = "#fff";
  ctx.fillText("SYRUP", x - 5, y - 10);

  // Lemon
  ctx.fillStyle = "#ffff4d";
  ctx.beginPath();
  ctx.arc(x + 100, y + 40, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText("LEMON", x + 80, y - 10);

  // Soda
  ctx.fillStyle = "#73f2ff";
  ctx.fillRect(x + 200, y, 35, 80);
  ctx.fillStyle = "#fff";
  ctx.fillText("SODA", x + 200, y - 10);
}

function drawStirTool(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 100, y);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.fillText("STIR", x + 35, y + 20);
}

function drawDraggedPreview(ctx: CanvasRenderingContext2D, x: number, y: number, item: string) {
  ctx.save();
  
  // Center the item on mouse and add a slight "grabbed" tilt
  ctx.translate(x, y);
  ctx.rotate(0.05); // Subtle tilt
  
  if (item === "select_vodka") {
    ctx.translate(-20, -50);
    ctx.fillStyle = "#c8f0ff";
    ctx.fillRect(0, 0, 40, 100);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.strokeRect(0, 0, 40, 100);
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.fillText("VODKA", 2, 50);
  } else if (item === "select_gin") {
    ctx.translate(-20, -50);
    ctx.fillStyle = "#b4ffb4";
    ctx.fillRect(0, 0, 40, 100);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.strokeRect(0, 0, 40, 100);
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.fillText("GIN", 8, 50);
  } else if (item === "select_whisky") {
    ctx.translate(-20, -50);
    ctx.fillStyle = "#c89632";
    ctx.fillRect(0, 0, 40, 100);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.strokeRect(0, 0, 40, 100);
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.fillText("WHISKY", 0, 50);
  } else if (item === "add_ice") {
    ctx.translate(-15, -15);
    ctx.fillStyle = "rgba(200, 240, 255, 0.9)";
    ctx.fillRect(0, 0, 30, 30);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(0, 0, 30, 30);
  } else if (item === "add_syrup") {
    ctx.translate(-15, -40);
    ctx.fillStyle = "#ff73a8";
    ctx.fillRect(0, 0, 30, 80);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.strokeRect(0, 0, 30, 80);
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.fillText("SYRUP", 0, 40);
  } else if (item === "add_lemon") {
    ctx.fillStyle = "#ffff4d";
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (item === "add_soda") {
    ctx.translate(-17, -40);
    ctx.fillStyle = "#73f2ff";
    ctx.fillRect(0, 0, 35, 80);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.strokeRect(0, 0, 35, 80);
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.fillText("SODA", 4, 40);
  } else if (item === "stir") {
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-60, 0);
    ctx.lineTo(60, 0);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillText("STIR", -10, 20);
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

function drawPixelCup(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, drink: any) {
  // 绘制杯子背部
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(x - w / 2, y - h, w, h);

  // 绘制液体
  const fillPercent = Math.min(1, drink.volume / 200);
  if (fillPercent > 0) {
    const liqHeight = fillPercent * (h - 20);
    const liqY = y - liqHeight - 10;
    
    // 渐变液体
    const grad = ctx.createLinearGradient(x, liqY, x, y - 10);
    const baseColor = getLiquidColor(drink.baseSpirit);
    grad.addColorStop(0, baseColor);
    grad.addColorStop(1, shadeColor(baseColor, -30));
    
    ctx.fillStyle = grad;
    ctx.fillRect(x - w / 2 + 10, liqY, w - 20, liqHeight);

    // 绘制冰块 (Pixel style)
    if (drink.temperature < 15) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(x - 15, y - 40, 20, 20);
      ctx.fillRect(x + 5, y - 70, 15, 15);
    }

    // 绘制气泡
    if (drink.sparkle > 20) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (let i = 0; i < 5; i++) {
        const bx = x - w/2 + 15 + Math.random() * (w - 30);
        const by = y - 20 - Math.random() * (liqHeight - 10);
        ctx.fillRect(bx, by, 3, 3);
      }
    }
  }

  // 绘制杯子外框（带厚度的像素风）
  ctx.strokeStyle = "rgba(200, 240, 255, 0.9)";
  ctx.lineWidth = 10;
  ctx.strokeRect(x - w / 2, y - h, w, h);
  
  // 杯口高光
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h);
  ctx.lineTo(x + w / 2, y - h);
  ctx.stroke();
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

function getLiquidColor(spirit: string | null): string {
  switch (spirit) {
    case "vodka": return "#c8f0ff";
    case "gin": return "#b4ffb4";
    case "whisky": return "#c89632";
    default: return "#ffffff";
  }
}

