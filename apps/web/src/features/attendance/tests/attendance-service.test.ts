import { describe, it, expect } from 'vitest';
import { AttendanceService } from '../services/attendance-service';

describe('AttendanceService Unit Tests', () => {
  it('formatMinutes accurately converts minutes into formatted strings', () => {
    expect(AttendanceService.formatMinutes(45)).toBe('45m');
    expect(AttendanceService.formatMinutes(60)).toBe('1h 0m');
    expect(AttendanceService.formatMinutes(510)).toBe('8h 30m');
    expect(AttendanceService.formatMinutes(535)).toBe('8h 55m');
  });
});
