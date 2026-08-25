import { describe, it, expect } from 'vitest';
import { CsvExtractor } from '../extractors/csv-extractor';

describe('CsvExtractor Unit Tests', () => {
  it('parses standard comma-delimited CSV with quoted strings', () => {
    const csvContent = `Name,Company,Email,Phone,Deal Value\n"Alice Smith","Acme Inc","alice@acme.com","+1 555-0100","50000"\n"Bob Jones","Global Tech","bob@global.io","+1 555-0200","25000"`;
    const result = CsvExtractor.parse(csvContent);

    expect(result.headers).toEqual(['Name', 'Company', 'Email', 'Phone', 'Deal Value']);
    expect(result.totalRows).toBe(2);
    expect(result.rows[0]['Name']).toBe('Alice Smith');
    expect(result.rows[0]['Company']).toBe('Acme Inc');
    expect(result.rows[1]['Email']).toBe('bob@global.io');
  });

  it('auto-detects semicolon-delimited CSV', () => {
    const csvContent = `Customer;Address;Tax ID;Status\nStarlight Media;742 Evergreen;TAX-9988;ACTIVE`;
    const result = CsvExtractor.parse(csvContent);

    expect(result.headers).toEqual(['Customer', 'Address', 'Tax ID', 'Status']);
    expect(result.totalRows).toBe(1);
    expect(result.rows[0]['Tax ID']).toBe('TAX-9988');
  });

  it('handles empty or whitespace lines gracefully', () => {
    const csvContent = `\n\nName,Email\n\nJohn,john@example.com\n\n`;
    const result = CsvExtractor.parse(csvContent);

    expect(result.headers).toEqual(['Name', 'Email']);
    expect(result.totalRows).toBe(1);
    expect(result.rows[0]['Name']).toBe('John');
  });
});
