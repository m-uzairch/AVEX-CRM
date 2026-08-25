import { describe, it, expect } from 'vitest';
import {
  clockInSchema,
  clockOutSchema,
  attendanceAdjustSchema,
} from '../schemas/attendance-schemas';

describe('Attendance Schemas Validation', () => {
  describe('clockInSchema & clockOutSchema', () => {
    it('should validate empty or populated clock-in payload', () => {
      const result = clockInSchema.safeParse({
        notes: 'Working from office',
        location: 'HQ Floor 4',
        device: 'MacBook Pro Chrome',
      });
      expect(result.success).toBe(true);

      const emptyResult = clockInSchema.safeParse({});
      expect(emptyResult.success).toBe(true);
    });

    it('should validate clock-out payload', () => {
      const result = clockOutSchema.safeParse({
        notes: 'Finished sprint tasks for today',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('attendanceAdjustSchema', () => {
    it('should validate admin attendance adjustment payload', () => {
      const result = attendanceAdjustSchema.safeParse({
        userId: 'usr_003',
        date: '2026-08-24',
        clockInTime: '09:00',
        clockOutTime: '18:00',
        status: 'PRESENT',
        notes: 'Biometric fingerprint sync regularization',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const result = attendanceAdjustSchema.safeParse({
        userId: 'usr_003',
        date: '24-08-2026', // Invalid format
        status: 'PRESENT',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const result = attendanceAdjustSchema.safeParse({
        userId: 'usr_003',
        date: '2026-08-24',
        clockInTime: '25:99', // Invalid time
        status: 'PRESENT',
      });
      expect(result.success).toBe(false);
    });
  });
});
