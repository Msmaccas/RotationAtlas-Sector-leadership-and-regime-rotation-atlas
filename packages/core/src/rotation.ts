import { generateId, LeadershipCohort, RotationEvent, EvidenceRecord, FragilityEvent, ConfidenceLevel } from './models';

/**
 * computeRelativeStrength calculates the relative strength of each sector by
 * dividing its return by the benchmark return. It returns a map of date to
 * ranking arrays sorted descending by relative strength value. Missing or
 * undefined values result in a confidence flag of NOT_AVAILABLE.
 */
export interface SectorReturnRecord {
  date: string;
  sectorReturns: Record<string, number | null>; // sector code -> daily or weekly return
  benchmarkReturn: number | null;
}

export interface RelativeStrengthResult {
  date: string;
  ranking: { sector: string; value: number; confidence: ConfidenceLevel }[];
  evidence: EvidenceRecord[];
}

export function computeRelativeStrength(records: SectorReturnRecord[]): RelativeStrengthResult[] {
  return records.map((rec) => {
    const evidence: EvidenceRecord[] = [];
    const ranking: { sector: string; value: number; confidence: ConfidenceLevel }[] = [];
    Object.entries(rec.sectorReturns).forEach(([sector, val]) => {
      let confidence: ConfidenceLevel = 'OK';
      let relative = 0;
      if (val == null || rec.benchmarkReturn == null) {
        confidence = 'NOT_AVAILABLE';
        relative = 0;
      } else if (rec.benchmarkReturn === 0) {
        confidence = 'MANUAL_REVIEW';
        relative = 0;
      } else {
        relative = val / rec.benchmarkReturn;
      }
      ranking.push({ sector, value: relative, confidence });
      const evId = generateId('evid');
      evidence.push({
        id: evId,
        source: 'relative-strength',
        timestamp: new Date(rec.date),
        description: `Relative strength for ${sector} on ${rec.date}`,
        value: relative,
        confidence,
        type: 'CONFIRMING',
      });
    });
    // sort descending by value
    ranking.sort((a, b) => b.value - a.value);
    return {
      date: rec.date,
      ranking,
      evidence,
    };
  });
}

/**
 * detectRotationEvents looks at consecutive relative strength rankings and
 * identifies when the top ranked sector changes. It outputs RotationEvents
 * capturing the transition. Additional logic could incorporate fragility and
 * breadth but this is a simplified demonstration.
 */
export function detectRotationEvents(rsResults: RelativeStrengthResult[]): RotationEvent[] {
  const events: RotationEvent[] = [];
  let prevTop: string | null = null;
  rsResults.forEach((res) => {
    if (res.ranking.length === 0) return;
    const currentTop = res.ranking[0].sector;
    if (prevTop && currentTop !== prevTop) {
      const eventId = generateId('rotation');
      events.push({
        id: eventId,
        date: new Date(res.date),
        fromCohort: prevTop,
        toCohort: currentTop,
        description: `Rotation detected: leadership moved from ${prevTop} to ${currentTop}`,
        evidenceIds: res.evidence.map((e) => e.id),
        confidence: 'OK',
      });
    }
    prevTop = currentTop;
  });
  return events;
}

/**
 * computeFragilityEvents assesses whether the top N leaders are becoming more
 * concentrated. If fewer than threshold sectors account for more than a given
 * share of relative strength sum, a fragility event is produced.
 */
export function computeFragilityEvents(
  rsResults: RelativeStrengthResult[],
  thresholdConcentration: number = 0.5,
  topN: number = 3,
): FragilityEvent[] {
  const events: FragilityEvent[] = [];
  rsResults.forEach((res) => {
    const total = res.ranking.reduce((sum, r) => sum + Math.abs(r.value), 0);
    const top = res.ranking.slice(0, topN);
    const topSum = top.reduce((sum, r) => sum + Math.abs(r.value), 0);
    if (total === 0) return;
    if (topSum / total > thresholdConcentration) {
      const eventId = generateId('fragility');
      events.push({
        id: eventId,
        date: new Date(res.date),
        cohortId: top[0].sector,
        description: `Fragility detected: top ${topN} sectors account for ${(topSum / total * 100).toFixed(1)}% of relative strength`,
        evidenceIds: res.evidence.map((e) => e.id),
        confidence: 'LOW_CONFIDENCE',
      });
    }
  });
  return events;
}