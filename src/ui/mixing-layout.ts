export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MixingViewLayout = {
  isCompactLandscape: boolean;
  assetScale: number;
  tableY: number;
  tableHeight: number;
  propY: number;
  spiritsOrigin: { x: number; y: number };
  spiritsHitbox: Rect;
  spiritsThresholds: number[];
  iceBoxRect: Rect;
  cup: {
    x: number;
    y: number;
    width: number;
    height: number;
    dropRect: Rect;
  };
  additivesOrigin: { x: number; y: number };
  additivesHitbox: Rect;
  additivesThresholds: number[];
  stirToolsRect: Rect;
  advancedToolsRect: Rect;
  advancedToolThresholds: number[];
  waveArea: Rect & { centerY: number };
  infoBox: Rect;
  infoTextY: number;
  hintY: number;
  parameterText: { x: number; y: number };
};

export function isCompactLandscapeViewport(width: number, height: number): boolean {
  return width > height && (width <= 932 || height <= 500);
}

export function getMixingViewLayout(width: number, height: number): MixingViewLayout {
  const isCompactLandscape = isCompactLandscapeViewport(width, height);
  const assetScale = isCompactLandscape ? 0.68 : 1;
  const sidePadding = isCompactLandscape ? 12 : 24;

  const spiritVisualWidth = 442 * assetScale;
  const additiveVisualWidth = 500 * assetScale;
  const stirVisualWidth = 160 * assetScale;
  const advancedVisualWidth = 256 * assetScale;
  const iceVisualSize = 100 * assetScale;

  const tableHeight = isCompactLandscape ? Math.min(168, Math.max(145, height * 0.42)) : 300;
  const tableY = height - tableHeight;
  const propY = tableY + (isCompactLandscape ? 26 : 60);

  const spiritsOrigin = {
    x: isCompactLandscape ? sidePadding : 60,
    y: propY - (isCompactLandscape ? 26 : 40),
  };
  const spiritsHitbox = {
    x: spiritsOrigin.x,
    y: spiritsOrigin.y - (isCompactLandscape ? 10 : 0),
    width: isCompactLandscape ? spiritVisualWidth + 26 : 460,
    height: isCompactLandscape ? 112 : 140,
  };
  const spiritsThresholds = isCompactLandscape ? [72, 152, 242] : [100, 210, 330];

  const iceBoxX = isCompactLandscape ? width * 0.39 - iceVisualSize / 2 : width / 2 - 300;
  const iceBoxY = propY + (isCompactLandscape ? 4 : 20);
  const iceBoxRect = {
    x: iceBoxX,
    y: iceBoxY,
    width: isCompactLandscape ? iceVisualSize : 120,
    height: isCompactLandscape ? iceVisualSize : 120,
  };

  const cupWidth = isCompactLandscape ? 62 : 80;
  const cupHeight = isCompactLandscape ? 96 : 120;
  const cupX = isCompactLandscape ? width * 0.54 : width / 2;
  const cupY = isCompactLandscape ? tableY + tableHeight - 18 : tableY + 180;
  const cupDropPaddingX = isCompactLandscape ? 70 : 80;
  const cupDropPaddingTop = isCompactLandscape ? 70 : 80;
  const cupDropPaddingBottom = isCompactLandscape ? 28 : 40;

  const additivesOrigin = {
    x: isCompactLandscape ? width - additiveVisualWidth - sidePadding : width - 620,
    y: propY - (isCompactLandscape ? 4 : 20),
  };
  const additivesHitbox = {
    x: additivesOrigin.x,
    y: additivesOrigin.y - 10,
    width: isCompactLandscape ? additiveVisualWidth + 18 : 520,
    height: isCompactLandscape ? 84 : 120,
  };
  const additivesThresholds = isCompactLandscape ? [74, 172, 244, 320] : [110, 240, 340, 440];

  const stirToolsRect = {
    x: isCompactLandscape ? width * 0.60 : width / 2 + 70,
    y: propY + (isCompactLandscape ? 38 : 50),
    width: isCompactLandscape ? stirVisualWidth : 200,
    height: isCompactLandscape ? 82 : 100,
  };

  const advancedToolsRect = {
    x: isCompactLandscape ? width - advancedVisualWidth - sidePadding - 6 : width - 380,
    y: propY + (isCompactLandscape ? 72 : 80),
    width: isCompactLandscape ? advancedVisualWidth + 10 : 380,
    height: isCompactLandscape ? 84 : 100,
  };
  const advancedToolThresholds = isCompactLandscape ? [70, 138] : [90, 190];

  const waveAreaWidth = isCompactLandscape ? width * 0.72 : width * 0.85;
  const waveAreaHeight = isCompactLandscape ? Math.min(136, height * 0.34) : 320;
  const waveAreaX = (width - waveAreaWidth) / 2;
  const waveCenterY = isCompactLandscape ? Math.max(84, height * 0.245) : (height - waveAreaHeight) / 2 - 80;

  const infoBoxHeight = isCompactLandscape ? 64 : 100;
  const infoBoxWidth = isCompactLandscape ? width * 0.62 : width * 0.7;
  const screenBottomY = waveCenterY + waveAreaHeight / 2;
  const infoBoxY = screenBottomY + (isCompactLandscape ? 8 : 10);
  const infoTextY = infoBoxY + (isCompactLandscape ? 21 : 35);
  const hintY = infoBoxY + infoBoxHeight - (isCompactLandscape ? 10 : 15);

  return {
    isCompactLandscape,
    assetScale,
    tableY,
    tableHeight,
    propY,
    spiritsOrigin,
    spiritsHitbox,
    spiritsThresholds,
    iceBoxRect,
    cup: {
      x: cupX,
      y: cupY,
      width: cupWidth,
      height: cupHeight,
      dropRect: {
        x: cupX - cupDropPaddingX,
        y: cupY - cupHeight - cupDropPaddingTop,
        width: cupDropPaddingX * 2,
        height: cupHeight + cupDropPaddingTop + cupDropPaddingBottom,
      },
    },
    additivesOrigin,
    additivesHitbox,
    additivesThresholds,
    stirToolsRect,
    advancedToolsRect,
    advancedToolThresholds,
    waveArea: {
      x: waveAreaX,
      y: waveCenterY - waveAreaHeight / 2,
      width: waveAreaWidth,
      height: waveAreaHeight,
      centerY: waveCenterY,
    },
    infoBox: {
      x: (width - infoBoxWidth) / 2,
      y: infoBoxY,
      width: infoBoxWidth,
      height: infoBoxHeight,
    },
    infoTextY,
    hintY,
    parameterText: {
      x: waveAreaX + waveAreaWidth - 10,
      y: waveCenterY - waveAreaHeight / 2 + (isCompactLandscape ? 20 : 25),
    },
  };
}
