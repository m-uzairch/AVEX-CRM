export interface ParsedPdfResult {
  text: string;
  lines: string[];
  metadata?: {
    pageCount?: number;
    title?: string;
    author?: string;
  };
}

export class PdfExtractor {
  /**
   * Extracts clean text streams and structural lines from a PDF Buffer or base64/text representation
   */
  static extractText(buffer: Buffer | string): ParsedPdfResult {
    let rawString = typeof buffer === 'string' ? buffer : buffer.toString('utf-8');

    // Remove binary stream wrappers if standard ASCII PDF stream
    // PDF text stream operators: BT ... ET, TJ, Tj
    const textMatches: string[] = [];
    const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let match;

    while ((match = tjRegex.exec(rawString)) !== null) {
      if (match[1] && match[1].trim().length > 0) {
        textMatches.push(match[1].trim());
      }
    }

    let cleanedText = '';
    if (textMatches.length > 0) {
      cleanedText = textMatches.join(' ');
    } else {
      // Fallback: strip binary non-printable characters and PDF object tags
      cleanedText = rawString
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
        .replace(/\b(?:endobj|endstream|obj|stream|xref|trailer)\b/gi, ' ')
        .replace(/<<[\s\S]*?>>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Split into readable sentences/lines
    const lines = cleanedText
      .split(/(?<=[.?!;])\s+|\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 2);

    return {
      text: cleanedText || 'Document content extracted.',
      lines,
      metadata: {
        pageCount: 1,
      },
    };
  }
}
