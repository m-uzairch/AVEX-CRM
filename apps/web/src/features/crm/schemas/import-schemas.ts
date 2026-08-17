import { z } from 'zod';

export const allowedFileExtensions = ['csv', 'xlsx', 'pdf', 'png', 'jpg', 'jpeg', 'webp'];
export const maxFileSize = 20 * 1024 * 1024; // 20 MB

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required.'),
  fileSize: z
    .number()
    .max(maxFileSize, 'File size exceeds maximum 20MB limit.'),
  fileType: z
    .string()
    .refine((val) => {
      const ext = val.toLowerCase().split('.').pop() || val.toLowerCase();
      return allowedFileExtensions.includes(ext) || val.includes('csv') || val.includes('spreadsheet') || val.includes('pdf') || val.includes('image');
    }, 'Unsupported file format. Please upload CSV, XLSX, PDF, PNG, JPG, or WEBP.'),
});

export type FileUploadSchema = z.infer<typeof fileUploadSchema>;

export const fieldMappingSchema = z.array(
  z.object({
    fileColumn: z.string(),
    crmField: z.string(),
  })
);

export type FieldMappingSchema = z.infer<typeof fieldMappingSchema>;

export const parsedRowSchema = z.object({
  rowId: z.string(),
  name: z.string().min(1, 'Lead name is required.'),
  companyName: z.string().min(1, 'Company name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(3, 'Phone is required.'),
  source: z.string().optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().optional(),
  duplicateStrategy: z.enum(['SKIP', 'UPDATE', 'CREATE_NEW']).optional(),
});

export type ParsedRowSchema = z.infer<typeof parsedRowSchema>;
