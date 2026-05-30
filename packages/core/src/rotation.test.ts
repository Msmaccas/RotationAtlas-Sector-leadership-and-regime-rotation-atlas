import { computeRelativeStrength, detectRotationEvents, computeFragilityEvents } from './rotation';

describe('Rotation analytics', () => {
  test('computes relative strength and detects rotations', () => {
    const data = [
      {
        date: '2026-05-01',
        sectorReturns: { XLE: 0.02, XLK: 0.03, XLF: 0.01 },
        benchmarkReturn: 0.015,
      },
      {
        date: '2026-05-02',
        sectorReturns: { XLE: 0.01, XLK: 0.02, XLF: 0.03 },
        benchmarkReturn: 0.015,
      },
    ];
    const rs = computeRelativeStrength(data);
    expect(rs.length).toBe(2);
    const first = rs[0];
    expect(first.ranking[0].sector).toBe('XLK');
    const events = detectRotationEvents(rs);
    expect(events.length).toBe(1);
    expect(events[0].fromCohort).toBe('XLK');
    expect(events[0].toCohort).toBe('XLF');
  });

  test('computes fragility events', () => {
    const data = [
      {
        date: '2026-05-01',
        sectorReturns: { XLE: 0.05, XLK: 0.001, XLF: 0.002 },
        benchmarkReturn: 0.01,
      },
    ];
    const rs = computeRelativeStrength(data);
    const fragility = computeFragilityEvents(rs, 0.5, 1);
    expect(fragility.length).toBeGreaterThanOrEqual(1);
  });
});