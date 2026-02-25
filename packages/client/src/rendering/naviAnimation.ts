export const ANIMATION_FRAME_MS = 100;
export const MOVE_ANIMATION_MS = 300;

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
