import { z } from 'zod';
import { BattleState, PlayerAction } from './BattleState';

// Queue events
export const QueueJoinSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
});
export type QueueJoin = z.infer<typeof QueueJoinSchema>;

export const QueueLeaveSchema = z.object({
  playerId: z.string(),
});
export type QueueLeave = z.infer<typeof QueueLeaveSchema>;

// Battle events
export const BattleInputSchema = z.object({
  frame: z.number(),
  action: z.object({
    type: z.enum(['move', 'chip_select', 'confirm']),
    chipId: z.string().optional(),
    gridX: z.number().optional(),
    gridY: z.number().optional(),
  }),
});
export type BattleInput = z.infer<typeof BattleInputSchema>;

export const BattleUpdateSchema = z.object({
  frame: z.number(),
  state: z.any() as z.ZodType<BattleState>,
  events: z.array(z.object({
    type: z.string(),
    data: z.any(),
  })),
});
export type BattleUpdate = z.infer<typeof BattleUpdateSchema>;
