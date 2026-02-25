export const ANIMATION_FRAME_MS = 100;
export const MOVE_ANIMATION_MS = 300;
export const FORTE_IDLE_BOB_PX = 2;
export const FORTE_IDLE_BOB_PERIOD_MS = 600;

export interface IdleProfile {
  mode: 'static' | 'bob';
  frameIndex: number;
  bobPx: number;
  bobPeriodMs: number;
}

export const IDLE_PROFILES: Record<'player1' | 'player2', IdleProfile> = {
  // MegaMan should stay visually steady while idle.
  player1: { mode: 'static', frameIndex: 0, bobPx: 0, bobPeriodMs: 0 },
  // Forte keeps a subtle vertical breathing motion.
  player2: {
    mode: 'bob',
    frameIndex: 0,
    bobPx: FORTE_IDLE_BOB_PX,
    bobPeriodMs: FORTE_IDLE_BOB_PERIOD_MS,
  },
};

export interface GridPosition {
  x: number;
  y: number;
}

export const getLoopFrameIndex = (elapsedMs: number, frameCount: number): number => {
  return Math.floor(elapsedMs / ANIMATION_FRAME_MS) % frameCount;
};

export const getBusterFrameIndex = (elapsedMs: number): number => {
  return Math.min(3, Math.floor(elapsedMs / ANIMATION_FRAME_MS));
};

export const getMoveFrameIndex = (elapsedMs: number): number => {
  if (elapsedMs < ANIMATION_FRAME_MS) return 0;
  if (elapsedMs < ANIMATION_FRAME_MS * 2) return 1;
  return 2;
};

export const getMoveRenderPosition = (
  source: GridPosition,
  target: GridPosition,
  elapsedMs: number
): GridPosition => {
  const frame = getMoveFrameIndex(elapsedMs);
  if (frame === 0) return source;
  if (frame === 1) {
    return {
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2,
    };
  }
  return target;
};

export const getIdleBobOffsetY = (
  elapsedMs: number,
  bobPx: number,
  bobPeriodMs: number
): number => {
  if (bobPx <= 0 || bobPeriodMs <= 0) return 0;
  return Math.sin((elapsedMs / bobPeriodMs) * Math.PI * 2) * bobPx;
};
