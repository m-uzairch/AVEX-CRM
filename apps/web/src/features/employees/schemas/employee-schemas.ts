import { z } from 'zod';

export const employeeCreateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().max(30, 'Phone number is too long').optional().nullable(),
  role: z.string().min(1, 'Role / Job title is required').max(100, 'Role is too long'),
  department: z.string().max(100, 'Department name is too long').optional().nullable(),
  employmentStatus: z
    .enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED'])
    .default('ACTIVE'),
  hireDate: z.string().optional().nullable(),
  terminationDate: z.string().optional().nullable(),
  avatarUrl: z.string().url('Avatar must be a valid URL').optional().nullable().or(z.literal('')),
  userId: z.string().optional().nullable(),
});

export const employeeUpdateSchema = employeeCreateSchema.partial();

export const employeeStatusUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED'], {
    errorMap: () => ({ message: 'Status must be ACTIVE, ON_LEAVE, or TERMINATED' }),
  }),
});

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
export type EmployeeStatusUpdateInput = z.infer<typeof employeeStatusUpdateSchema>;
