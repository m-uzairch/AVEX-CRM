import { CsvExtractor, ParsedCsvResult } from './csv-extractor';
import { PdfExtractor, ParsedPdfResult } from './pdf-extractor';

export type SupportedDocumentType = 'CSV' | 'PDF' | 'TEXT' | 'JSON';

export interface DocumentExtractionOutput {
  fileType: SupportedDocumentType;
  fileName: string;
  fileSize: number;
  rawText: string;
  csvData?: ParsedCsvResult;
  pdfData?: ParsedPdfResult;
}

export class DocumentExtractorFactory {
  /**
   * Identifies file type and parses content into raw text and structural data
   */
  static extract(
    buffer: Buffer,
    fileName: string,
    mimeType?: string
  ): DocumentExtractionOutput {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    let fileType: SupportedDocumentType = 'TEXT';

    if (ext === 'csv' || mimeType === 'text/csv') {
      fileType = 'CSV';
      const text = buffer.toString('utf-8');
      const csvData = CsvExtractor.parse(text);
      return {
        fileType,
        fileName,
        fileSize: buffer.length,
        rawText: text,
        csvData,
      };
    }

    if (ext === 'pdf' || mimeType === 'application/pdf') {
      fileType = 'PDF';
      const pdfData = PdfExtractor.extractText(buffer);
      return {
        fileType,
        fileName,
        fileSize: buffer.length,
        rawText: pdfData.text,
        pdfData,
      };
    }

    if (ext === 'json' || mimeType === 'application/json') {
      fileType = 'JSON';
      const text = buffer.toString('utf-8');
      return {
        fileType,
        fileName,
        fileSize: buffer.length,
        rawText: text,
      };
    }

    // Default: Plain text
    const text = buffer.toString('utf-8');
    return {
      fileType: 'TEXT',
      fileName,
      fileSize: buffer.length,
      rawText: text,
    };
  }
}
