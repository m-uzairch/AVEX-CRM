import { z } from 'zod';

export const leadStageUpdateSchema = z.object({
  toStage: z.enum([
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'WON',
    'LOST',
  ]),
  stageOrder: z.number().int().min(0).optional(),
});

export type LeadStageUpdateSchema = z.infer<typeof leadStageUpdateSchema>;

export const dealInfoUpdateSchema = z.object({
  expectedDealValue: z.number().min(0, 'Deal value cannot be negative.').optional(),
  expectedClosingDate: z.string().optional().or(z.literal('')),
  winProbability: z
    .number()
    .min(0, 'Probability cannot be negative.')
    .max(100, 'Probability cannot exceed 100%.')
    .optional(),
});

export type DealInfoUpdateSchema = z.infer<typeof dealInfoUpdateSchema>;
