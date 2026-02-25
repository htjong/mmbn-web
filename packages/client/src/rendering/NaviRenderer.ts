import Phaser from 'phaser';
import { PlayerState } from '@mmbn/shared';
import {
  ANIMATION_FRAME_MS,
  IDLE_PROFILES,
  MOVE_ANIMATION_MS,
  getBusterFrameIndex,
  getIdleBobOffsetY,
  getMoveRenderPosition,
} from './naviAnimation';
import { NAVI_SPRITES } from './naviSprites';

const PLAYER_SCALE_MULTIPLIER: Record<'player1' | 'player2', number> = {
  player1: 1,
  player2: 1.25,
};

const PLAYER_RENDER_OFFSET_RATIO: Record<'player1' | 'player2', { x: number; y: number }> = {
  // Calibrated from panel size 60 tuning.
  player1: { x: -11 / 60, y: 0 },
  player2: { x: 1 / 60, y: -6 / 60 },
};

export class NaviRenderer {
  private scene: Phaser.Scene;
  private player: 'player1' | 'player2';
  private panelSize: number;
  private sprite?: Phaser.GameObjects.Sprite;
  private idleElapsedMs = 0;
  private busterElapsedMs = 0;
  private activeBusterPhase: PlayerState['busterPhase'] = 'idle';
  private moveElapsedMs = MOVE_ANIMATION_MS;
  private moveSource?: { x: number; y: number };
  private moveTarget?: { x: number; y: number };
  private previousGridPosition?: { x: number; y: number };

  constructor(scene: Phaser.Scene, player: 'player1' | 'player2', panelSize: number) {
    this.scene = scene;
    this.player = player;
    this.panelSize = panelSize;
  }

  update(playerState: PlayerState, gridStartX: number, gridStartY: number, panelSize: number) {
    const deltaMs = this.scene.game.loop.delta;
    const position = playerState.position;

    if (
      this.previousGridPosition &&
      (this.previousGridPosition.x !== position.x || this.previousGridPosition.y !== position.y)
    ) {
      this.moveSource = this.previousGridPosition;
      this.moveTarget = { ...position };
      this.moveElapsedMs = 0;
    }
    this.previousGridPosition = { ...position };

    if (!this.sprite) {
      const initialTexture = NAVI_SPRITES[this.player].ready[0];
      this.sprite = this.scene.add.sprite(0, 0, initialTexture);
      const targetHeight = this.panelSize - 4;
      const baseScale = targetHeight / this.sprite.height;
      this.sprite.setScale(baseScale * PLAYER_SCALE_MULTIPLIER[this.player]);
      this.sprite.setOrigin(0.5, 0.5);
      this.sprite.setDepth(10);
    }

    if (this.moveElapsedMs < MOVE_ANIMATION_MS) {
      this.moveElapsedMs = Math.min(this.moveElapsedMs + deltaMs, MOVE_ANIMATION_MS);
    }

    let renderPosition = { ...position };
    if (this.moveSource && this.moveTarget && this.moveElapsedMs < MOVE_ANIMATION_MS) {
      renderPosition = getMoveRenderPosition(this.moveSource, this.moveTarget, this.moveElapsedMs);
    } else if (this.moveElapsedMs >= MOVE_ANIMATION_MS) {
      this.moveSource = undefined;
      this.moveTarget = undefined;
    }

    const screenX = gridStartX + renderPosition.x * panelSize + panelSize / 2;
    const screenY = gridStartY + renderPosition.y * panelSize + panelSize / 2;
    const renderOffsetRatio = PLAYER_RENDER_OFFSET_RATIO[this.player];
    const renderOffsetX = Math.round(panelSize * renderOffsetRatio.x);
    const renderOffsetY = Math.round(panelSize * renderOffsetRatio.y);
    const anchoredScreenX = screenX + renderOffsetX;
    const anchoredScreenY = screenY + renderOffsetY;
    this.sprite.setPosition(anchoredScreenX, anchoredScreenY);

    const busterActive =
      playerState.busterPhase === 'firing' || playerState.busterPhase === 'landing';
    if (busterActive) {
      if (this.activeBusterPhase !== playerState.busterPhase) {
        this.busterElapsedMs = playerState.busterPhase === 'firing' ? 0 : ANIMATION_FRAME_MS * 4;
      } else {
        this.busterElapsedMs += deltaMs;
      }
      const frameIndex = getBusterFrameIndex(this.busterElapsedMs);
      this.sprite.setTexture(NAVI_SPRITES[this.player].buster[frameIndex]);
      this.sprite.setPosition(anchoredScreenX, anchoredScreenY);
      this.activeBusterPhase = playerState.busterPhase;
      return;
    }

    this.activeBusterPhase = playerState.busterPhase;
    if (this.moveSource && this.moveTarget && this.moveElapsedMs < MOVE_ANIMATION_MS) {
      const moveFrameIndex = Math.min(2, Math.floor(this.moveElapsedMs / ANIMATION_FRAME_MS));
      this.sprite.setTexture(NAVI_SPRITES[this.player].move[moveFrameIndex]);
      return;
    }

    this.idleElapsedMs += deltaMs;
    const idleProfile = IDLE_PROFILES[this.player];
    this.sprite.setTexture(NAVI_SPRITES[this.player].ready[idleProfile.frameIndex]);
    const idleBobOffsetY =
      idleProfile.mode === 'bob'
        ? getIdleBobOffsetY(this.idleElapsedMs, idleProfile.bobPx, idleProfile.bobPeriodMs)
        : 0;
    this.sprite.setPosition(anchoredScreenX, anchoredScreenY + idleBobOffsetY);
  }
}
