import { describe, it, expect } from 'vitest';
import { PdfExtractor } from '../extractors/pdf-extractor';

describe('PdfExtractor Unit Tests', () => {
  it('extracts text streams from PDF stream representations', () => {
    const rawPdfStream = `BT /F1 12 Tf (Master Services Agreement) Tj ET BT (Party A agrees to deliver) Tj ET`;
    const result = PdfExtractor.extractText(rawPdfStream);

    expect(result.text).toContain('Master Services Agreement');
    expect(result.text).toContain('Party A agrees to deliver');
    expect(result.lines.length).toBeGreaterThan(0);
  });

  it('cleans non-printable binary characters from raw text PDF fallbacks', () => {
    const rawContent = `%PDF-1.4 1 0 obj << /Title (Project RFP) >> endobj stream Confidential Proposal for Enterprise Client. Deadline: 2026-10-15 endstream`;
    const result = PdfExtractor.extractText(rawContent);

    expect(result.text).toContain('Confidential Proposal');
    expect(result.text).toContain('Deadline: 2026-10-15');
  });
});
