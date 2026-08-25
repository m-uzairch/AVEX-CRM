/**
 * Robust JSON extraction and parser for LLM responses
 */
export class AIResponseParser {
  /**
   * Strips markdown fences and parses JSON safely
   */
  static extractJson<T = any>(rawText: string): T {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('Empty or invalid response received from AI model');
    }

    let cleaned = rawText.trim();

    // 1. Remove markdown code block fences (```json ... ``` or ``` ... ```)
    const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = cleaned.match(markdownRegex);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }

    // 2. If text starts with non-JSON text, attempt finding outer '{' and '}' or '[' and ']'
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }
    } else if (firstBracket !== -1) {
      const lastBracket = cleaned.lastIndexOf(']');
      if (lastBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
      }
    }

    // 3. Attempt standard parse
    try {
      return JSON.parse(cleaned);
    } catch {
      // 4. Try basic JSON sanitation (fixing trailing commas before closing braces)
      const sanitized = cleaned
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":'); // Quote unquoted keys if any

      try {
        return JSON.parse(sanitized);
      } catch (err: any) {
        throw new Error(`Failed to parse structured JSON from AI response: ${err?.message || 'Invalid syntax'}`);
      }
    }
  }
}
