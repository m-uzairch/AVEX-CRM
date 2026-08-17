import { z } from 'zod';

export const leadFormSchema = z.object({
  name: z.string().min(2, 'Lead name must be at least 2 characters.'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters.'),
  alternatePhone: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  businessType: z.string().optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  companySize: z.string().optional().or(z.literal('')),
  source: z.string().min(1, 'Lead source is required.'),
  status: z.enum([
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'WON',
    'LOST',
  ]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  score: z
    .number()
    .min(0, 'Score must be at least 0.')
    .max(100, 'Score cannot exceed 100.')
    .default(50),
  assignedEmployeeId: z.string().optional().or(z.literal('')),
  expectedDealValue: z
    .number()
    .min(0, 'Deal value cannot be negative.')
    .optional()
    .or(z.literal(0)),
  expectedClosingDate: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
});

export type LeadFormSchema = z.infer<typeof leadFormSchema>;

export const leadNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty.'),
});

export type LeadNoteSchema = z.infer<typeof leadNoteSchema>;

export const leadAssignSchema = z.object({
  assignedEmployeeId: z.string().min(1, 'Please select an employee.'),
});

export type LeadAssignSchema = z.infer<typeof leadAssignSchema>;

export const leadConvertSchema = z.object({
  customerStatus: z.string().default('ACTIVE'),
  notes: z.string().optional(),
});

export type LeadConvertSchema = z.infer<typeof leadConvertSchema>;

export const leadBulkActionSchema = z.object({
  leadIds: z.array(z.string()).min(1, 'Please select at least one lead.'),
  action: z.enum([
    'ASSIGN_EMPLOYEE',
    'CHANGE_STATUS',
    'CHANGE_PRIORITY',
    'ADD_TAGS',
    'REMOVE_TAGS',
    'ARCHIVE',
    'RESTORE',
    'DELETE',
  ]),
  assignedEmployeeId: z.string().optional(),
  status: z
    .enum([
      'NEW',
      'CONTACTED',
      'QUALIFIED',
      'PROPOSAL_SENT',
      'NEGOTIATION',
      'WON',
      'LOST',
    ])
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  tags: z.array(z.string()).optional(),
});

export type LeadBulkActionSchema = z.infer<typeof leadBulkActionSchema>;
