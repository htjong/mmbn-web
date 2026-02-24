import { create } from 'zustand';
import { BattleEngine, BattleState, PlayerAction } from '@mmbn/shared';

let gameStartTextTimer: ReturnType<typeof setTimeout> | null = null;
let postConfirmUnlockTimer: ReturnType<typeof setTimeout> | null = null;

function clearPostConfirmTimers() {
  if (gameStartTextTimer) {
    clearTimeout(gameStartTextTimer);
    gameStartTextTimer = null;
  }
  if (postConfirmUnlockTimer) {
    clearTimeout(postConfirmUnlockTimer);
    postConfirmUnlockTimer = null;
  }
}

interface BattleStore {
  // State
  gamePhase: 'menu' | 'battle';
  battleState: BattleState | null;
  customScreenOpen: boolean;
  postConfirmLockActive: boolean;
  gameStartTextVisible: boolean;
  chipCursorIndex: number;
  chipCursorOnOk: boolean;
  customSelectedChipIndices: number[];

  // Actions (called by Phaser)
  startGame: () => void;
  init: (state: BattleState) => void;
  applyAction: (playerId: string, action: PlayerAction) => void;
  tick: () => void;
  openCustomScreen: () => void;
  startPostConfirmLock: () => void;
  showGameStartText: () => void;
  endPostConfirmLock: () => void;

  // Actions (called by React — chip select navigation)
  moveCursorLeft: () => void;
  moveCursorRight: () => void;
  moveCursorUp: () => void;
  moveCursorDown: () => void;
  focusOk: () => void;
  returnToChipFromOk: () => void;
  selectCurrentChip: () => void;
  rejectLastChip: () => void;
  confirmChips: () => void;
}

export const useBattleStore = create<BattleStore>((set) => ({
  gamePhase: 'menu',
  battleState: null,
  customScreenOpen: false,
  postConfirmLockActive: false,
  gameStartTextVisible: false,
  chipCursorIndex: 0,
  chipCursorOnOk: false,
  customSelectedChipIndices: [],

  startGame: () => set({ gamePhase: 'battle' }),

  init: (state) => set({ battleState: state }),

  applyAction: (playerId, action) =>
    set((store) => {
      if (!store.battleState) return store;
      const { state: newState } = BattleEngine.applyAction(store.battleState, playerId, action);
      return { battleState: newState };
    }),

  tick: () =>
    set((store) => {
      if (!store.battleState) return store;
      const { state: newState } = BattleEngine.tick(store.battleState);
      return { battleState: newState };
    }),

  openCustomScreen: () =>
    set((store) => {
      if (!store.battleState) return store;
      clearPostConfirmTimers();
      return {
        customScreenOpen: true,
        postConfirmLockActive: false,
        gameStartTextVisible: false,
        chipCursorIndex: 0,
        chipCursorOnOk: false,
        customSelectedChipIndices: [],
        battleState: {
          ...store.battleState,
          player1: {
            ...store.battleState.player1,
            customGauge: 0,
          },
          player2: {
            ...store.battleState.player2,
            customGauge: 0,
          },
        },
      };
    }),

  startPostConfirmLock: () => {
    clearPostConfirmTimers();
    set({ postConfirmLockActive: true, gameStartTextVisible: false });
    gameStartTextTimer = setTimeout(() => {
      useBattleStore.getState().showGameStartText();
    }, 1000);
    postConfirmUnlockTimer = setTimeout(() => {
      useBattleStore.getState().endPostConfirmLock();
    }, 2000);
  },

  showGameStartText: () => set({ gameStartTextVisible: true }),

  endPostConfirmLock: () => {
    clearPostConfirmTimers();
    set({ postConfirmLockActive: false, gameStartTextVisible: false });
  },

  moveCursorLeft: () =>
    set((store) => {
      if (store.chipCursorOnOk) {
        return { chipCursorOnOk: false };
      }
      const col = store.chipCursorIndex % 5;
      if (col > 0) {
        return { chipCursorIndex: store.chipCursorIndex - 1 };
      }
      return store;
    }),

  moveCursorRight: () =>
    set((store) => {
      if (store.chipCursorOnOk) return store;
      const hand = store.battleState?.player1.hand ?? [];
      const col = store.chipCursorIndex % 5;
      const nextIndex = store.chipCursorIndex + 1;
      const isLastInRow = col === 4 || nextIndex >= hand.length;
      if (isLastInRow) {
        return { chipCursorOnOk: true };
      }
      return { chipCursorIndex: nextIndex };
    }),

  moveCursorUp: () =>
    set((store) => {
      if (store.chipCursorOnOk) return store;
      const row = Math.floor(store.chipCursorIndex / 5);
      if (row > 0) {
        return { chipCursorIndex: store.chipCursorIndex - 5 };
      }
      return store;
    }),

  moveCursorDown: () =>
    set((store) => {
      if (store.chipCursorOnOk) return store;
      const hand = store.battleState?.player1.hand ?? [];
      const row = Math.floor(store.chipCursorIndex / 5);
      if (row === 0 && hand.length > 5) {
        const newIndex = Math.min(store.chipCursorIndex + 5, hand.length - 1);
        return { chipCursorIndex: newIndex };
      }
      return store;
    }),

  focusOk: () => set({ chipCursorOnOk: true }),

  returnToChipFromOk: () => set({ chipCursorOnOk: false }),

  selectCurrentChip: () =>
    set((store) => {
      const { chipCursorIndex, customSelectedChipIndices } = store;
      if (
        customSelectedChipIndices.length < 5 &&
        !customSelectedChipIndices.includes(chipCursorIndex)
      ) {
        return { customSelectedChipIndices: [...customSelectedChipIndices, chipCursorIndex] };
      }
      return store;
    }),

  rejectLastChip: () =>
    set((store) => {
      if (store.customSelectedChipIndices.length > 0) {
        return {
          customSelectedChipIndices: store.customSelectedChipIndices.slice(0, -1),
        };
      }
      return store;
    }),

  confirmChips: () => {
    clearPostConfirmTimers();
    set((store) => {
      if (!store.battleState) return store;
      let currentState = store.battleState;

      // customSelectedChipIndices is already in selection order — no sort needed
      for (const index of store.customSelectedChipIndices) {
        const chip = currentState.player1.hand[index];
        if (chip) {
          const { state: newState } = BattleEngine.applyAction(currentState, 'player1', {
            type: 'chip_select',
            chipId: chip.id,
          });
          currentState = newState;
        }
      }

      // Confirm AI chips for this round before battle resumes.
      // Pick up to 3 chips from the front of hand.
      const aiChipIds = currentState.player2.hand.slice(0, 3).map((chip) => chip.id);
      for (const chipId of aiChipIds) {
        const { state: aiUpdatedState } = BattleEngine.applyAction(currentState, 'player2', {
          type: 'chip_select',
          chipId,
        });
        currentState = aiUpdatedState;
      }

      return {
        battleState: currentState,
        customScreenOpen: false,
        postConfirmLockActive: true,
        gameStartTextVisible: false,
        chipCursorIndex: 0,
        chipCursorOnOk: false,
        customSelectedChipIndices: [],
      };
    });

    gameStartTextTimer = setTimeout(() => {
      useBattleStore.getState().showGameStartText();
    }, 1000);
    postConfirmUnlockTimer = setTimeout(() => {
      useBattleStore.getState().endPostConfirmLock();
    }, 2000);
  },
}));
