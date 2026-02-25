import { describe, expect, it } from 'vitest';
import {
  ANIMATION_FRAME_MS,
  FORTE_IDLE_BOB_PERIOD_MS,
  FORTE_IDLE_BOB_PX,
  IDLE_PROFILES,
  MOVE_ANIMATION_MS,
  getBusterFrameIndex,
  getIdleBobOffsetY,
  getLoopFrameIndex,
  getMoveFrameIndex,
  getMoveRenderPosition,
} from './naviAnimation';

describe('naviAnimation helpers', () => {
  it('cycles ready frames every 100ms', () => {
    expect(getLoopFrameIndex(0, 4)).toBe(0);
    expect(getLoopFrameIndex(ANIMATION_FRAME_MS, 4)).toBe(1);
    expect(getLoopFrameIndex(ANIMATION_FRAME_MS * 2, 4)).toBe(2);
    expect(getLoopFrameIndex(ANIMATION_FRAME_MS * 4, 4)).toBe(0);
  });

  it('advances buster frames and clamps to frame 4', () => {
    expect(getBusterFrameIndex(0)).toBe(0);
    expect(getBusterFrameIndex(ANIMATION_FRAME_MS)).toBe(1);
    expect(getBusterFrameIndex(ANIMATION_FRAME_MS * 2)).toBe(2);
    expect(getBusterFrameIndex(ANIMATION_FRAME_MS * 3)).toBe(3);
    expect(getBusterFrameIndex(ANIMATION_FRAME_MS * 10)).toBe(3);
  });

  it('steps movement through source, midpoint, and target frames', () => {
    expect(getMoveFrameIndex(0)).toBe(0);
    expect(getMoveFrameIndex(ANIMATION_FRAME_MS)).toBe(1);
    expect(getMoveFrameIndex(MOVE_ANIMATION_MS - 1)).toBe(2);
  });

  it('returns render positions that match movement frame semantics', () => {
    const source = { x: 1, y: 1 };
    const target = { x: 2, y: 1 };

    expect(getMoveRenderPosition(source, target, 0)).toEqual(source);
    expect(getMoveRenderPosition(source, target, ANIMATION_FRAME_MS)).toEqual({ x: 1.5, y: 1 });
    expect(getMoveRenderPosition(source, target, MOVE_ANIMATION_MS)).toEqual(target);
  });

  it('keeps player1 idle profile static', () => {
    expect(IDLE_PROFILES.player1.mode).toBe('static');
    expect(IDLE_PROFILES.player1.bobPx).toBe(0);
    expect(IDLE_PROFILES.player1.frameIndex).toBe(0);
  });

  it('keeps player2 idle bob offset vertical within amplitude', () => {
    expect(getIdleBobOffsetY(0, FORTE_IDLE_BOB_PX, FORTE_IDLE_BOB_PERIOD_MS)).toBe(0);
    expect(
      getIdleBobOffsetY(FORTE_IDLE_BOB_PERIOD_MS, FORTE_IDLE_BOB_PX, FORTE_IDLE_BOB_PERIOD_MS)
    ).toBeCloseTo(0, 6);
    const quarter = getIdleBobOffsetY(
      FORTE_IDLE_BOB_PERIOD_MS / 4,
      FORTE_IDLE_BOB_PX,
      FORTE_IDLE_BOB_PERIOD_MS
    );
    expect(quarter).toBeCloseTo(FORTE_IDLE_BOB_PX, 6);
    expect(Math.abs(quarter)).toBeLessThanOrEqual(FORTE_IDLE_BOB_PX);
  });
});
