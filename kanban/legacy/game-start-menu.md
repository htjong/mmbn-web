# Add Game Start Menu with Title Screen and Jack-In Transition

## Origin
> Copied from `kanban/ideas/game-start-menu.md` (now deleted)

Title screen with Start button that transitions into the battle scene.

## Chosen Direction: Classic Title with Live Demo + Jack-In Transition
**Concept:** A classic MMBN3-faithful title screen where any loading time is spent in the title state. The PRESS START (spacebar) prompt fades in once the game is ready. Behind the title logo, a live AI-vs-AI battle plays at reduced opacity. The MMBN battle theme plays on loop from the moment the title screen appears and continues through the jack-in sequence and into the main menu. Pressing START triggers a "JACK-IN PROTOCOL: INITIATED" jack-in sequence animation, then lands on a proper main menu (Campaign / PVP / Settings) with an animated "jacked in" cyberworld background.
**Key Mechanic:** The title screen is a living window — loading, demo battle, looping theme music, and player readiness all converge at one moment: the PRESS START fade-in. The jack-in sequence is the transition ritual between "outside" and "inside" the game.
**What It Adds:** Every screen has personality — the title teases gameplay with music and a live demo, the jack-in sequence sets narrative tone, and the main menu feels like being jacked into the cyberworld rather than staring at a static list.

---

## Description
On game launch, the player arrives at a MMBN3-faithful title screen where loading
completes silently; the PRESS START prompt fades in only once the game is ready to
play. A live AI-vs-AI demo battle plays at reduced opacity behind the title logo and
auto-restarts whenever a winner is declared. Pressing SPACEBAR triggers a "JACK-IN
PROTOCOL: INITIATED" sequence that plays to completion before landing on a main menu
offering Campaign (disabled), PVP, and Settings. The MMBN battle theme plays on loop
from the title screen through all subsequent screens without interruption.

## Acceptance Criteria
- [ ] Title screen appears on game launch; the PRESS START prompt is hidden during
      loading and fades in once the game is fully ready
- [ ] An AI-vs-AI demo battle renders at reduced opacity behind the title logo;
      when either navi's HP reaches zero, the demo battle automatically restarts
- [ ] The MMBN battle theme begins looping the moment the title screen is visible
      and continues uninterrupted through the jack-in sequence, main menu, and
      settings page
- [ ] Pressing SPACEBAR on the title screen triggers the jack-in sequence
      ("JACK-IN PROTOCOL: INITIATED"); it cannot be skipped and plays fully
      before the main menu appears
- [ ] The main menu presents three options: Campaign, PVP, and Settings; Campaign
      is visible and focusable but non-interactive (clearly indicated as
      unavailable, e.g. greyed out / no confirm action)
- [ ] Selecting PVP from the main menu initiates the existing PVP matchmaking flow
- [ ] Selecting Settings navigates to a Settings page containing only a Back
      button; pressing Back returns to the main menu
- [ ] Main menu and Settings page are navigable with MMBN-consistent keyboard
      controls: W/S to move cursor, K or SPACEBAR to confirm, J to go back
- [ ] SimpleAI handles the full Custom Screen flow: opens the Custom Screen via
      confirm action when its gauge is full, optionally selects chips, and exits
      the Custom Screen when done — both AI navis in the demo battle exhibit
      this behavior

## Notes
- Key files: `packages/client/src/main.ts`, `packages/client/src/scenes/BattleScene.ts`
- New Phaser scenes needed: `TitleScene`, `MainMenuScene`, `SettingsScene`
  (or React overlays — implementer's call)
- Demo battle reuse: `SimpleAI` (two instances, one per player) +
  `BattleEngine.createInitialState()` / `.tick()` / `.applyAction()` — same
  pattern as `BattleScene.ts`; manage local `BattleState` in `TitleScene`,
  do NOT use `useBattleStore` for the demo
- Detect demo battle end via `BattleState.isGameOver`; restart by calling
  `BattleEngine.createInitialState()` with fresh `drawChips()` hands
- Renderer opacity: `GridRenderer` and `NaviRenderer` need a `setAlpha()` surface
  (wrap game objects in a Phaser `Container`, or add a method to each renderer)
- React root conflict: `main.ts` unconditionally mounts `BattleHud` today; add an
  `appStore.ts` (or `sceneStore.ts`) with a `currentScene` field so the React root
  renders the correct UI layer per scene — do this first before adding new scenes
- Audio: use Phaser's `this.sound.add('battle-theme', { loop: true })` in
  `TitleScene.preload/create()`; audio asset goes under `packages/client/public/`;
  do NOT call `stopAll()` on scene transitions to keep the loop alive
- SimpleAI custom screen flow: extend `SimpleAI` with an internal
  `customScreenOpen: boolean` flag; emit `confirm` (gauge full, screen closed) →
  emit `chip_select` × N → emit `confirm` (close); `TitleScene.update()` handles
  these the same way `BattleScene.update()` handles the human player's confirm —
  no separate state machine needed, no new `PlayerAction` types required
- MMBN3 reference: jack-in sequence = blue data-stream tunnel animation;
  main menu background = animated cyberworld grid pattern

## Suggested Implementation Order
1. Add `appStore.ts` with `currentScene` field; update React root in `main.ts`
2. Implement `TitleScene` (static logo + PRESS START only) → verify scene
   transitions to `MainMenuScene` end-to-end
3. Implement `MainMenuScene` and `SettingsScene` with keyboard navigation
4. Wire PVP option from `MainMenuScene` to existing matchmaking flow
5. Add demo battle to `TitleScene` (local state, both players AI-driven)
6. Add renderer opacity (`setAlpha` on `GridRenderer` / `NaviRenderer`)
7. Extend `SimpleAI` with custom screen flow (`customScreenOpen` flag)
8. Add audio asset and wire looping theme in `TitleScene`
9. Implement jack-in animation sequence
