import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getToday } from '@/app/api/attendance/today/route';
import { POST as postClockIn } from '@/app/api/attendance/clock-in/route';
import { POST as postClockOut } from '@/app/api/attendance/clock-out/route';
import { GET as getHistory } from '@/app/api/attendance/history/route';
import { GET as getTeam } from '@/app/api/attendance/team/route';
import { POST as postAdjust } from '@/app/api/attendance/adjust/route';

function createMockRequest(
  url: string,
  options: { method?: string; body?: any; cookies?: Record<string, string> } = {}
) {
  const req = new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (options.cookies) {
    Object.entries(options.cookies).forEach(([k, v]) => {
      req.cookies.set(k, v);
    });
  }

  return req;
}

describe('Attendance API & Multi-Tenant Security Suite', () => {
  it('GET /api/attendance/today returns user status and shift config', async () => {
    const req = createMockRequest('/api/attendance/today');
    const res = await getToday(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.shiftConfig).toBeDefined();
    expect(data.shiftConfig.shiftStart).toBe('09:00');
  });

  it('POST /api/attendance/clock-out records clock out and working time', async () => {
    const req = createMockRequest('/api/attendance/clock-out', {
      method: 'POST',
      body: { notes: 'Leaving office' },
    });

    const res = await postClockOut(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.record).toBeDefined();
    expect(data.record.clockOut).toBeDefined();
    expect(data.record.workingMinutes).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/attendance/clock-in creates a new clock in record', async () => {
    // Reset or clean today record for user_owner_001 to test fresh clock in
    const req = createMockRequest('/api/attendance/clock-in', {
      method: 'POST',
      body: { notes: 'Starting shift' },
    });

    const res = await postClockIn(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.record).toBeDefined();
    expect(data.record.clockIn).toBeDefined();
  });

  it('GET /api/attendance/history returns attendance history and summary stats', async () => {
    const req = createMockRequest('/api/attendance/history');
    const res = await getHistory(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.records).toBeInstanceOf(Array);
    expect(data.summary).toBeDefined();
    expect(data.summary.totalDays).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/attendance/team returns company presence roster and KPIs for admin', async () => {
    const req = createMockRequest('/api/attendance/team');
    const res = await getTeam(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.team).toBeInstanceOf(Array);
    expect(data.kpis).toBeDefined();
    expect(data.kpis.totalEmployees).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/attendance/adjust regularizes employee attendance record', async () => {
    const req = createMockRequest('/api/attendance/adjust', {
      method: 'POST',
      body: {
        userId: 'usr_003',
        date: '2026-08-24',
        clockInTime: '08:50',
        clockOutTime: '17:30',
        status: 'PRESENT',
        notes: 'Manager approved regularization',
      },
    });

    const res = await postAdjust(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.record.status).toBe('PRESENT');
    expect(data.record.workingMinutes).toBe(520);
  });

  it('GET /api/attendance/team rejects unauthorized non-admin employee with 403', async () => {
    const req = createMockRequest('/api/attendance/team', {
      cookies: {
        user_role: 'EMPLOYEE',
      },
    });

    const res = await getTeam(req);
    expect(res.status).toBe(403);
  });
});
