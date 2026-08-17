import { z } from 'zod';

export const fileCategoryEnum = z.enum([
  'DOCUMENTS',
  'DESIGNS',
  'CONTRACTS',
  'REPORTS',
  'IMAGES',
  'DEVELOPMENT',
  'DELIVERABLES',
  'OTHER',
]);

export const folderFormSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Folder name is required').max(100),
  parentId: z.string().optional().nullable(),
});

export const fileUploadSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  folderId: z.string().optional().nullable(),
  name: z.string().min(1, 'File name is required'),
  category: fileCategoryEnum.default('DOCUMENTS'),
  isClientVisible: z.boolean().default(false),
});

export const fileVersionSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
  changeNotes: z.string().optional(),
});

export type FolderFormValues = z.infer<typeof folderFormSchema>;
export type FileUploadValues = z.infer<typeof fileUploadSchema>;
export type FileVersionValues = z.infer<typeof fileVersionSchema>;
