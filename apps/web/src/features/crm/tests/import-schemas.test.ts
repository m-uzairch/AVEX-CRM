import { describe, it, expect } from 'vitest';
import { fileUploadSchema, parsedRowSchema } from '../schemas/import-schemas';

describe('AI Lead Import Validation Schemas', () => {
  it('validates a correct file upload payload under 20MB', () => {
    const validFile = {
      fileName: 'leads_batch_2026.xlsx',
      fileSize: 5 * 1024 * 1024, // 5MB
      fileType: 'xlsx',
    };
    expect(fileUploadSchema.safeParse(validFile).success).toBe(true);
  });

  it('rejects files exceeding 20MB limit', () => {
    const oversizedFile = {
      fileName: 'huge_document.pdf',
      fileSize: 25 * 1024 * 1024, // 25MB
      fileType: 'pdf',
    };
    expect(fileUploadSchema.safeParse(oversizedFile).success).toBe(false);
  });

  it('rejects unsupported file extensions', () => {
    const invalidFormat = {
      fileName: 'executable_file.exe',
      fileSize: 1000,
      fileType: 'exe',
    };
    expect(fileUploadSchema.safeParse(invalidFormat).success).toBe(false);
  });

  it('validates a parsed row item schema', () => {
    const validRow = {
      rowId: 'row-1',
      name: 'Sarah Connor',
      companyName: 'Cyberdyne Systems',
      email: 'sarah@cyberdyne.com',
      phone: '+1 555-0199',
      duplicateStrategy: 'SKIP',
    };
    expect(parsedRowSchema.safeParse(validRow).success).toBe(true);
  });
});
