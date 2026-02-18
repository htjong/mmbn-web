# Feature Design Workflow

A 3-stage pipeline for turning vague ideas into implementable backlog cards.

```
idea → /feature-explore (diverge) → user picks → /feature-formalize (converge + review) → backlog card
```

## Usage Examples

### `/feature-explore` — Brainstorm directions

```
/feature-explore kanban/ideas/mobile-support.md   # Existing idea card
/feature-explore shield chips                       # Freeform text
/feature-explore                                    # No args — asks what to explore
```

### `/feature-formalize` — Converge into a spec

```
/feature-formalize kanban/ideas/mobile-support.md  # Card with chosen direction
/feature-formalize                                  # No args — lists cards with chosen directions
```

## What Each Stage Does

### Stage 1: `/feature-explore` (Diverge)

Generates 3-4 genuinely distinct design directions for a feature idea. Each direction includes a name, concept, key mechanic, and what it adds to gameplay. Interactive — you can steer, ask "what about X?", or request hybrids until you commit to a direction.

**Reads:** `CLAUDE.md` (game domain only, no source code)
**Writes:** Appends `## Chosen Direction` to the idea card in `kanban/ideas/`

### Stage 2: `/feature-formalize` (Converge)

Takes a chosen direction and turns it into a precise backlog card. Reads the codebase to understand existing architecture, asks 2-4 clarifying questions about edge cases, then drafts a spec with description, acceptance criteria, and implementation notes.

**Reads:** Idea card + 8+ source files from `packages/`
**Writes:** Final card to `kanban/backlog/`

### Stage 3: Architecture Review (Automatic)

Spawned automatically by `/feature-formalize` after you confirm the draft spec. An isolated reviewer agent checks the spec against the codebase and rates 8 categories. Results are presented before the card is written — RED items gate the pipeline.

## File Outputs

| Stage | Output Location | Format |
|-------|----------------|--------|
| `/feature-explore` | `kanban/ideas/<card>.md` | Appends `## Chosen Direction` section |
| `/feature-formalize` | `kanban/backlog/<card>.md` | Full backlog card (description + AC + notes) |

## Architecture Review Categories

The reviewer rates each category **GREEN**, **YELLOW**, or **RED**:

| # | Category | What It Checks |
|---|----------|---------------|
| 1 | **Determinism** | Will shared logic remain pure? No `Math.random`, `Date.now`, side effects? |
| 2 | **State Impact** | New fields in `PlayerState` or `BattleState`? Changed constraints? |
| 3 | **Networking** | New Socket.io events? Zod schema changes? Bandwidth impact at 60Hz? |
| 4 | **Grid/Panel Impact** | New panel states? New ownership rules? |
| 5 | **Chip System** | New `ChipEffect.type` values? New `Chip` fields? |
| 6 | **Client Rendering** | New Phaser sprites/animations? New React UI? |
| 7 | **Existing Code Reuse** | Functions/types the implementer should use (with file paths) |
| 8 | **Risk Assessment** | Blast radius, hidden complexity, suggested implementation order |

### Rating Meanings

- **GREEN** — No issues, existing code handles it
- **YELLOW** — Needs careful implementation, flagged for attention
- **RED** — Blocking: breaks determinism, requires architecture change, or conflicts with existing systems
