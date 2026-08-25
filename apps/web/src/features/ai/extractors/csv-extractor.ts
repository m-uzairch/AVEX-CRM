export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
  rawText: string;
  totalRows: number;
}

export class CsvExtractor {
  /**
   * Auto-detects delimiter (, ; \t |) and parses CSV text safely
   */
  static parse(csvText: string): ParsedCsvResult {
    if (!csvText || typeof csvText !== 'string') {
      return { headers: [], rows: [], rawText: '', totalRows: 0 };
    }

    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return { headers: [], rows: [], rawText: '', totalRows: 0 };
    }

    // Detect delimiter from first line
    const delimiter = this.detectDelimiter(lines[0]);
    const headers = this.parseLine(lines[0], delimiter);

    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseLine(lines[i], delimiter);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const rowObj: Record<string, string> = {};
      headers.forEach((header, idx) => {
        rowObj[header] = values[idx] || '';
      });

      rows.push(rowObj);
    }

    return {
      headers,
      rows,
      rawText: csvText,
      totalRows: rows.length,
    };
  }

  private static detectDelimiter(firstLine: string): string {
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxCount = 0;

    for (const d of delimiters) {
      const count = firstLine.split(d).length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = d;
      }
    }

    return bestDelimiter;
  }

  private static parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  }
}
