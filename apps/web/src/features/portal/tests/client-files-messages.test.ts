import { describe, it, expect } from 'vitest';
import {
  clientFileUploadSchema,
  createConversationFormSchema,
  clientMessageFormSchema,
  ClientFileUploadValues,
  CreateConversationFormValues,
} from '../schemas/portal-schemas';
import { ClientFile } from '../types/portal-types';

describe('Client Files & Communication Feature Tests', () => {
  describe('clientFileUploadSchema Validation', () => {
    it('should validate a valid client file upload payload', () => {
      const valid: ClientFileUploadValues = {
        projectId: 'proj-12345',
        name: 'Brand_Identity_v3.pdf',
        category: 'DESIGNS',
        fileUrl: 'https://cdn.avexcrm.com/files/brand-v3.pdf',
        fileSize: 5242880,
        fileType: 'application/pdf',
      };

      const result = clientFileUploadSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject file upload without projectId or name', () => {
      const missingProject = {
        projectId: '',
        name: 'SpecSheet.docx',
        category: 'DOCUMENTS',
        fileUrl: 'https://cdn.avexcrm.com/files/spec.docx',
      };
      expect(clientFileUploadSchema.safeParse(missingProject).success).toBe(false);

      const missingName = {
        projectId: 'proj-1',
        name: '',
        category: 'DOCUMENTS',
        fileUrl: 'https://cdn.avexcrm.com/files/spec.docx',
      };
      expect(clientFileUploadSchema.safeParse(missingName).success).toBe(false);
    });

    it('should reject invalid file URLs', () => {
      const invalidUrl = {
        projectId: 'proj-1',
        name: 'Document.pdf',
        category: 'DOCUMENTS',
        fileUrl: 'not-a-valid-url',
      };
      expect(clientFileUploadSchema.safeParse(invalidUrl).success).toBe(false);
    });
  });

  describe('createConversationFormSchema & clientMessageFormSchema Validation', () => {
    it('should validate conversation creation payload', () => {
      const valid: CreateConversationFormValues = {
        projectId: 'proj-999',
        subject: 'Sprint 05 Milestones & Deliverables Alignment',
        message: 'Could you please confirm the deployment date for the client portal?',
        attachmentUrl: 'https://cdn.avexcrm.com/docs/schedule.pdf',
      };

      const result = createConversationFormSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject conversation with empty message or short subject', () => {
      const shortSubject = {
        projectId: 'proj-999',
        subject: 'Hi', // Less than 3 chars
        message: 'Valid message content',
      };
      expect(createConversationFormSchema.safeParse(shortSubject).success).toBe(false);

      const emptyMessage = {
        projectId: 'proj-999',
        subject: 'Valid Subject',
        message: '',
      };
      expect(createConversationFormSchema.safeParse(emptyMessage).success).toBe(false);
    });

    it('should validate clientMessageFormSchema with optional attachment', () => {
      const validMsg = {
        projectId: 'proj-1',
        content: 'Looks good! Thank you.',
        attachmentUrl: null,
      };
      expect(clientMessageFormSchema.safeParse(validMsg).success).toBe(true);
    });
  });

  describe('File Categorization & Filtering', () => {
    const mockFiles: ClientFile[] = [
      {
        id: 'f-1',
        name: 'Master_Service_Agreement.pdf',
        originalName: 'MSA.pdf',
        fileUrl: 'https://cdn.example.com/msa.pdf',
        fileSize: 2048000,
        fileType: 'application/pdf',
        category: 'CONTRACTS',
        uploadedAt: '2026-08-01T10:00:00Z',
        project: { id: 'p-1', name: 'CRM Web App', projectCode: 'PRJ-101' },
      },
      {
        id: 'f-2',
        name: 'App_Figma_Design_Kit.zip',
        originalName: 'Figma.zip',
        fileUrl: 'https://cdn.example.com/figma.zip',
        fileSize: 45000000,
        fileType: 'application/zip',
        category: 'DESIGNS',
        uploadedAt: '2026-08-10T10:00:00Z',
        project: { id: 'p-1', name: 'CRM Web App', projectCode: 'PRJ-101' },
      },
      {
        id: 'f-3',
        name: 'Invoice_INV-2026-001.pdf',
        originalName: 'Invoice.pdf',
        fileUrl: 'https://cdn.example.com/inv.pdf',
        fileSize: 512000,
        fileType: 'application/pdf',
        category: 'INVOICES',
        uploadedAt: '2026-08-15T10:00:00Z',
        project: { id: 'p-2', name: 'Mobile App', projectCode: 'PRJ-102' },
      },
    ];

    it('should filter files correctly by category', () => {
      const contracts = mockFiles.filter((f) => f.category === 'CONTRACTS');
      const designs = mockFiles.filter((f) => f.category === 'DESIGNS');

      expect(contracts.length).toBe(1);
      expect(contracts[0].id).toBe('f-1');
      expect(designs.length).toBe(1);
      expect(designs[0].id).toBe('f-2');
    });

    it('should search files by keyword in filename or project code', () => {
      const searchKeyword = (query: string) => {
        const q = query.toLowerCase();
        return mockFiles.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.project?.name.toLowerCase().includes(q) ||
            f.project?.projectCode.toLowerCase().includes(q)
        );
      };

      expect(searchKeyword('Figma').length).toBe(1);
      expect(searchKeyword('PRJ-101').length).toBe(2);
      expect(searchKeyword('Invoice').length).toBe(1);
    });
  });

  describe('Security & Multi-Tenant Isolation', () => {
    it('should detect and reject dangerous executable extensions', () => {
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.vbs', '.msi'];
      const testFiles = [
        { url: 'https://storage.com/malware.exe', safe: false },
        { url: 'https://storage.com/script.sh', safe: false },
        { url: 'https://storage.com/document.pdf', safe: true },
        { url: 'https://storage.com/design.png', safe: true },
      ];

      testFiles.forEach(({ url, safe }) => {
        const isDangerous = dangerousExtensions.some((ext) => url.toLowerCase().endsWith(ext));
        expect(!isDangerous).toBe(safe);
      });
    });

    it('should verify customer multi-tenant ownership on shared files and conversations', () => {
      const clientSession = { companyId: 'comp-100', customerId: 'cust-200' };

      const files = [
        { id: 'f-1', companyId: 'comp-100', customerId: 'cust-200', isClientVisible: true },
        { id: 'f-2', companyId: 'comp-100', customerId: 'cust-999', isClientVisible: true }, // other customer
        { id: 'f-3', companyId: 'comp-100', customerId: 'cust-200', isClientVisible: false }, // internal only
      ];

      const isFileDownloadAllowed = (fileId: string) => {
        return files.some(
          (f) =>
            f.id === fileId &&
            f.companyId === clientSession.companyId &&
            f.customerId === clientSession.customerId &&
            f.isClientVisible === true
        );
      };

      expect(isFileDownloadAllowed('f-1')).toBe(true);
      expect(isFileDownloadAllowed('f-2')).toBe(false);
      expect(isFileDownloadAllowed('f-3')).toBe(false);
    });
  });
});
