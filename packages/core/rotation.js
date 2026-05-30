/**
 * Core analytics for RotationAtlas written in plain JavaScript.  These
 * functions compute relative strength, detect rotation events and assess
 * fragility of leadership.  They operate on simple JavaScript objects and
 * avoid external dependencies.
 */

const { generateId, ConfidenceLevels } = require('./models');

/**
 * computeRelativeStrength calculates the relative strength of each sector by
 * dividing its return by the benchmark return.  Missing values and zero
 * benchmarks are handled gracefully.  The function returns an array of
 * results sorted by date.
 *
 * @param {Array<{date: string, sectorReturns: Object<string, number|null>, benchmarkReturn: number|null}>} records
 * @returns {Array<{date: string, ranking: Array<{sector: string, value: number, confidence: string}>, evidence: Array<Object>}>}
 */
function computeRelativeStrength(records) {
  return records.map((rec) => {
    const evidence = [];
    const ranking = [];
    Object.entries(rec.sectorReturns).forEach(([sector, val]) => {
      let confidence = ConfidenceLevels.OK;
      let relative = 0;
      if (val == null || rec.benchmarkReturn == null) {
        confidence = ConfidenceLevels.NOT_AVAILABLE;
        relative = 0;
      } else if (rec.benchmarkReturn === 0) {
        confidence = ConfidenceLevels.MANUAL_REVIEW;
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
 * detectRotationEvents identifies when the top ranked sector changes from one
 * day to the next.  It returns an array of RotationEvent objects.
 *
 * @param {Array<Object>} rsResults Result of computeRelativeStrength
 * @returns {Array<Object>} Rotation events
 */
function detectRotationEvents(rsResults) {
  const events = [];
  let prevTop = null;
  rsResults.forEach((res) => {
    if (!res || !res.ranking || res.ranking.length === 0) return;
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
        confidence: ConfidenceLevels.OK,
      });
    }
    prevTop = currentTop;
  });
  return events;
}

/**
 * computeFragilityEvents assesses whether the top N leaders dominate the
 * relative strength.  If the concentration exceeds the threshold, a
 * FragilityEvent is generated.
 *
 * @param {Array<Object>} rsResults
 * @param {number} thresholdConcentration value between 0 and 1
 * @param {number} topN number of leaders to consider
 * @returns {Array<Object>}
 */
function computeFragilityEvents(rsResults, thresholdConcentration = 0.5, topN = 3) {
  const events = [];
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
        description: `Fragility detected: top ${topN} sectors account for ${((topSum / total) * 100).toFixed(1)}% of relative strength`,
        evidenceIds: res.evidence.map((e) => e.id),
        confidence: ConfidenceLevels.LOW_CONFIDENCE,
      });
    }
  });
  return events;
}

module.exports = {
  computeRelativeStrength,
  detectRotationEvents,
  computeFragilityEvents,
};