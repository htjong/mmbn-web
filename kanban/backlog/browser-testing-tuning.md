# Browser Testing & Tuning

## Description
Run the game in the browser via `npm run dev`, verify the full game loop works end-to-end, and fix any rendering or timing issues discovered during playtesting.

## Acceptance Criteria
- [ ] Game loads without errors in browser
- [ ] Full battle loop plays out: movement, buster, chips, AI opponent
- [ ] Win/lose condition triggers correctly (HP reaches 0)
- [ ] Custom gauge fills and enables chip selection
- [ ] No visual glitches or timing issues
- [ ] 60 FPS maintained during battle

## Notes
- Run with `npm run dev` (starts client on port 5173, server on port 3000)
- This is the final gate before First Playable milestone is achieved
- Fix issues in-place — don't defer to new cards unless scope is large
