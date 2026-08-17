import { z } from 'zod';

export const customerFormSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters.'),
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
  website: z.string().url('Please enter a valid URL (e.g. https://example.com)').optional().or(z.literal('')),
  companySize: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT', 'LOST', 'BLACKLISTED', 'ARCHIVED']).default('ACTIVE'),
  source: z.string().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedEmployeeId: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
});

export type CustomerFormSchemaValues = z.infer<typeof customerFormSchema>;

export const DEFAULT_CUSTOMER_FORM_VALUES: CustomerFormSchemaValues = {
  name: '',
  companyName: '',
  email: '',
  phone: '',
  alternatePhone: '',
  country: '',
  state: '',
  city: '',
  address: '',
  postalCode: '',
  industry: 'Technology',
  businessType: 'DIGITAL',
  website: '',
  companySize: '10-50',
  status: 'ACTIVE',
  source: 'Website',
  priority: 'MEDIUM',
  assignedEmployeeId: '',
  tags: [],
};
