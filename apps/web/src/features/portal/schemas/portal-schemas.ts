import { z } from 'zod';

export const clientLoginFormSchema = z.object({
  email: z.string().email('Please enter a valid client email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const changeRequestFormSchema = z.object({
  projectId: z.string().min(1, 'Please select a project'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().min(10, 'Please describe your request in detail'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export const clientMessageFormSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  content: z.string().min(1, 'Message content cannot be empty'),
});

export const clientProfileFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Valid email is required'),
  password: z.string().optional().nullable(),
});

export type ClientLoginFormValues = z.infer<typeof clientLoginFormSchema>;
export type ChangeRequestFormValues = z.infer<typeof changeRequestFormSchema>;
export type ClientMessageFormValues = z.infer<typeof clientMessageFormSchema>;
export type ClientProfileFormValues = z.infer<typeof clientProfileFormSchema>;
