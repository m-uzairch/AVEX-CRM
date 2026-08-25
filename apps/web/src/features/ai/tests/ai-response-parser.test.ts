import { describe, it, expect } from 'vitest';
import { AIResponseParser } from '../utils/ai-response-parser';

describe('AIResponseParser Unit Tests', () => {
  it('parses pure JSON string', () => {
    const raw = '{"name": "Bruce Wayne", "status": "ACTIVE"}';
    const parsed = AIResponseParser.extractJson<{ name: string; status: string }>(raw);
    expect(parsed.name).toBe('Bruce Wayne');
    expect(parsed.status).toBe('ACTIVE');
  });

  it('strips markdown ```json ... ``` code fences', () => {
    const raw = '```json\n{\n  "company": "Stark Industries",\n  "dealValue": 100000\n}\n```';
    const parsed = AIResponseParser.extractJson<{ company: string; dealValue: number }>(raw);
    expect(parsed.company).toBe('Stark Industries');
    expect(parsed.dealValue).toBe(100000);
  });

  it('extracts embedded JSON surrounded by conversational text', () => {
    const raw = 'Sure! Here is the extracted JSON payload:\n\n{\n  "total": 42\n}\n\nHope this helps!';
    const parsed = AIResponseParser.extractJson<{ total: number }>(raw);
    expect(parsed.total).toBe(42);
  });

  it('handles and repairs trailing commas before closing braces', () => {
    const raw = '{\n  "title": "Project Lead",\n  "active": true,\n}';
    const parsed = AIResponseParser.extractJson<{ title: string; active: boolean }>(raw);
    expect(parsed.title).toBe('Project Lead');
    expect(parsed.active).toBe(true);
  });

  it('throws descriptive error on malformed non-JSON input', () => {
    expect(() => AIResponseParser.extractJson('Just plain unstructured text with no braces')).toThrow();
  });
});
