## Chosen Direction: Combat-Ready Sprite Identity
**Concept:** Replace placeholder battlers with the provided player (`MMBN3_MM`) and simpleAI (`MMBN3_FORTE`) sprites across ready, movement, and buster actions. Keep animation timing strict at 100ms-per-frame so battle readability stays consistent across both combatants. Treat buster impact timing as a shared gameplay rule so visuals and hit registration remain synchronized.
**Key Mechanic:** Both combatants use 4-frame buster animation at 100ms/frame, then apply hit landing 100ms later, followed by a 200ms cooldown before another shot.
**What It Adds:** Stronger combat identity, readable action telegraphs, and a globally consistent buster cadence with no hold-to-auto-fire behavior.

## Sprite Set
- `simpleAI` prefix: `MMBN3_FORTE_RIGHT_FIELD_`
- `player` prefix: `MMBN3_MM_LEFT_FIELD_`
- `simpleAI` buster: `assets/MMBN3_FORTE_RIGHT_FIELD_BUSTER_1.png` to `assets/MMBN3_FORTE_RIGHT_FIELD_BUSTER_4.png`
- `simpleAI` move: `assets/MMBN3_FORTE_RIGHT_FIELD_MOVE_1.png` to `assets/MMBN3_FORTE_RIGHT_FIELD_MOVE_3.png`
- `simpleAI` ready: `assets/MMBN3_FORTE_RIGHT_FIELD_READY_1.png` to `assets/MMBN3_FORTE_RIGHT_FIELD_READY_4.png`
- `player` buster: `assets/MMBN3_MM_LEFT_FIELD_BUSTER_1.png` to `assets/MMBN3_MM_LEFT_FIELD_BUSTER_4.png`
- `player` move: `assets/MMBN3_MM_LEFT_FIELD_MOVE_1.png` to `assets/MMBN3_MM_LEFT_FIELD_MOVE_3.png`
- `player` ready: `assets/MMBN3_MM_LEFT_FIELD_READY_1.png` to `assets/MMBN3_MM_LEFT_FIELD_READY_4.png`

## Timing Rules
- Buster animation duration: `400ms` total (`4` frames at `100ms` each).
- Buster impact timing: hit lands `100ms` after frame 4 ends.
- Buster cooldown: `200ms` after landing before next shot can start.
- Movement animation: `300ms` total (`3` frames at `100ms` each): start cell, mid-transition, target cell landing.
- Ready animation: cycles continuously at `100ms` per frame when no other action is active.
- Input behavior: buster cannot be held; each shot requires a new `J` key press.
