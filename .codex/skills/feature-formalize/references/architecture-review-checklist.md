# Architecture Review Checklist

Use uppercase status labels only: `GREEN`, `YELLOW`, `RED`.

For each category, output:
- `Status`: `GREEN|YELLOW|RED`
- `Evidence`: concise rationale grounded in current code
- `Risk`: implementation risk if any
- `Mitigation`: concrete mitigation or `none`
- `Blocking`: `yes|no`

Categories:
1. Determinism in shared battle logic
2. State impact on `BattleState` / `PlayerState`
3. Network message/schema impact
4. Grid/panel rule impact
5. Chip-system type/effect impact
6. Client rendering/UI impact
7. Existing code reuse opportunities
8. Risk and implementation order

If any item is `RED` and unresolved, do not finalize the card.
