import { describe, it, expect } from 'vitest';
import { formatDate } from '../date';
import { formatCurrency } from '../currency';
import { truncate, slugify, capitalize } from '../string';
import { generateId } from '../id';

describe('Shared Utilities Suite (@avex/utils)', () => {
  describe('Date Utilities', () => {
    it('formats dates into custom string representations', () => {
      const d = new Date('2026-07-30T10:00:00Z');
      expect(formatDate(d, 'yyyy-MM-dd')).toBe('2026-07-30');
    });
  });

  describe('Currency Utilities', () => {
    it('formats numeric amounts into USD currency representation', () => {
      expect(formatCurrency(124500, 'USD')).toContain('124,500');
    });
  });

  describe('String Utilities', () => {
    it('truncates strings longer than specified max length', () => {
      expect(truncate('AVEX CRM Business Management', 10)).toBe('AVEX CRM B...');
      expect(truncate('AVEX', 10)).toBe('AVEX');
    });

    it('slugifies string into URL friendly slug', () => {
      expect(slugify('Acme Technologies Inc. Workspace')).toBe('acme-technologies-inc-workspace');
    });

    it('capitalizes first letter of string', () => {
      expect(capitalize('developer')).toBe('Developer');
    });
  });

  describe('ID Utilities', () => {
    it('generates unique ID with custom prefix', () => {
      const id1 = generateId('cust');
      const id2 = generateId('cust');
      expect(id1).toContain('cust_');
      expect(id1).not.toBe(id2);
    });
  });
});
