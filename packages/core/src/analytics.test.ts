import { computeRelativeStrength, detectRotationEvents } from './rotation';

describe('Additional analytics tests', () => {
  test('ranking stability yields no rotation events', () => {
    const data = [
      { date: '2026-01-01', sectorReturns: { A: 0.02, B: 0.02 }, benchmarkReturn: 0.01 },
      { date: '2026-01-02', sectorReturns: { A: 0.03, B: 0.03 }, benchmarkReturn: 0.015 },
      { date: '2026-01-03', sectorReturns: { A: 0.01, B: 0.01 }, benchmarkReturn: 0.005 },
    ];
    const rs = computeRelativeStrength(data);
    const events = detectRotationEvents(rs);
    expect(events.length).toBe(0);
  });
  test('handles missing data gracefully', () => {
    const data = [
      { date: '2026-01-01', sectorReturns: { A: null, B: 0.02 }, benchmarkReturn: 0.01 },
    ];
    const rs = computeRelativeStrength(data);
    expect(rs[0].ranking.some((r) => r.confidence === 'NOT_AVAILABLE')).toBe(true);
  });
});