# Create ChipSelectOverlay

## Description
UI overlay for selecting chips from folder when custom gauge is full. Spacebar opens the chip selection screen, player selects up to 5 chips, then confirms to return to battle with chips loaded.

## Acceptance Criteria
- [ ] Spacebar opens chip selection overlay when custom gauge is full
- [ ] Player can browse available chips in their folder
- [ ] Player can select up to 5 chips
- [ ] Confirm action closes overlay and loads selected chips
- [ ] Cancel returns to battle without selecting chips
- [ ] Selected chips appear in battle HUD and can be used with K key

## Notes
- Key files: `packages/client/src/ui/`, `packages/client/src/scenes/BattleScene.ts`
- ChipSystem and chip data already exist in `packages/shared/`
- InputHandler already maps Spacebar to open custom screen
- MMBN3 allows selecting up to 5 chips per custom screen opening
