const spriteAssetUrl = (filename: string): string =>
  new URL(`../../../../assets/normalized/${filename}`, import.meta.url).href;

export interface NaviSpriteSet {
  ready: [string, string, string, string];
  move: [string, string, string];
  buster: [string, string, string, string];
}

export const NAVI_SPRITES: Record<'player1' | 'player2', NaviSpriteSet> = {
  player1: {
    ready: ['player1-ready-1', 'player1-ready-2', 'player1-ready-3', 'player1-ready-4'],
    move: ['player1-move-1', 'player1-move-2', 'player1-move-3'],
    buster: ['player1-buster-1', 'player1-buster-2', 'player1-buster-3', 'player1-buster-4'],
  },
  player2: {
    ready: ['player2-ready-1', 'player2-ready-2', 'player2-ready-3', 'player2-ready-4'],
    move: ['player2-move-1', 'player2-move-2', 'player2-move-3'],
    buster: ['player2-buster-1', 'player2-buster-2', 'player2-buster-3', 'player2-buster-4'],
  },
};

export const NAVI_TEXTURES: Array<{ key: string; url: string }> = [
  { key: 'player1-buster-1', url: spriteAssetUrl('MMBN3_MM_LEFT_FIELD_BUSTER_1.png') },
  { key: 'player1-buster-2', url: spriteAssetUrl('MMBN3_MM_LEFT_FIELD_BUSTER_2.png') },
  { key: 'player1-buster-3', url: spriteAssetUrl('MMBN3_MM_LEFT_FIELD_BUSTER_3.png') },
  { key: 'player1-buster-4', url: spriteAssetUrl('MMBN3_MM_LEFT_FIELD_BUSTER_4.png') },
  { key: 'player1-move-1', url: spriteAssetUrl('MMBN3_MM_LEFT_FIELD_MOVE_1.png') },
  { key: 'player1-move-2', url: spriteAssetUrl('MMBN3_MM_LEFT_FIELD_MOVE_2.png') },
  { key: 'player1-move-3', url: spriteAssetUrl('MMBN3_MM_LEFT_FIELD_MOVE_3.png') },
  { key: 'player1-ready-1', url: spriteAssetUrl('MMBN3_MM_LEFT_FIELD_READY_1.png') },
  { key: 'player1-ready-2', url: spriteAssetUrl('MMBN3_MM_LEFT_FIELD_READY_2.png') },
  { key: 'player1-ready-3', url: spriteAssetUrl('MMBN3_MM_LEFT_FIELD_READY_3.png') },
  { key: 'player1-ready-4', url: spriteAssetUrl('MMBN3_MM_LEFT_FIELD_READY_4.png') },
  { key: 'player2-buster-1', url: spriteAssetUrl('MMBN3_FORTE_RIGHT_FIELD_BUSTER_1.png') },
  { key: 'player2-buster-2', url: spriteAssetUrl('MMBN3_FORTE_RIGHT_FIELD_BUSTER_2.png') },
  { key: 'player2-buster-3', url: spriteAssetUrl('MMBN3_FORTE_RIGHT_FIELD_BUSTER_3.png') },
  { key: 'player2-buster-4', url: spriteAssetUrl('MMBN3_FORTE_RIGHT_FIELD_BUSTER_4.png') },
  { key: 'player2-move-1', url: spriteAssetUrl('MMBN3_FORTE_RIGHT_FIELD_MOVE_1.png') },
  { key: 'player2-move-2', url: spriteAssetUrl('MMBN3_FORTE_RIGHT_FIELD_MOVE_2.png') },
  { key: 'player2-move-3', url: spriteAssetUrl('MMBN3_FORTE_RIGHT_FIELD_MOVE_3.png') },
  { key: 'player2-ready-1', url: spriteAssetUrl('MMBN3_FORTE_RIGHT_FIELD_READY_1.png') },
  { key: 'player2-ready-2', url: spriteAssetUrl('MMBN3_FORTE_RIGHT_FIELD_READY_2.png') },
  { key: 'player2-ready-3', url: spriteAssetUrl('MMBN3_FORTE_RIGHT_FIELD_READY_3.png') },
  { key: 'player2-ready-4', url: spriteAssetUrl('MMBN3_FORTE_RIGHT_FIELD_READY_4.png') },
];
