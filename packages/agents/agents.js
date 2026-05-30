/**
 * Multi‑agent workflow for RotationAtlas.  Agents consume data from a
 * FixtureDataProvider and produce summaries, details and evidence.  The
 * SynthesisAgent orchestrates other agents to produce a single narrative.
 */
// Use relative imports instead of package names so that the code can run
// without a prior `npm install`.  When running under npm workspaces the
// symlinked packages will also resolve correctly.
const { FixtureDataProvider } = require('../data');
const {
  computeRelativeStrength,
  detectRotationEvents,
  computeFragilityEvents,
} = require('../core');

// Simple ISO date formatting helper (YYYY-MM-DD)
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Base class for all agents.  Subclasses must implement run(ctx) and
 * return a promise resolving to an object with summary, details and evidence.
 */
class Agent {
  constructor(name) {
    this.name = name;
  }
  // eslint-disable-next-line no-unused-vars
  async run(ctx) {
    throw new Error('run() not implemented');
  }
}

/**
 * BreadthAgent analyses how many sectors outperform the benchmark each day
 * and summarises whether breadth is expanding, contracting or stable.
 */
class BreadthAgent extends Agent {
  constructor() {
    super('breadth');
  }
  async run(ctx) {
    const { provider, startDate, endDate } = ctx;
    const data = await provider.loadSectorReturns(startDate, endDate);
    const rs = computeRelativeStrength(data);
    const dailyBreadth = [];
    rs.forEach((r) => {
      const positive = r.ranking.filter((item) => item.value > 1).length;
      dailyBreadth.push({ date: r.date, breadth: positive, total: r.ranking.length });
    });
    let trend = 'stable';
    if (dailyBreadth.length > 1) {
      const first = dailyBreadth[0].breadth / dailyBreadth[0].total;
      const last = dailyBreadth[dailyBreadth.length - 1].breadth / dailyBreadth[dailyBreadth.length - 1].total;
      trend = last > first ? 'expanding' : last < first ? 'contracting' : 'stable';
    }
    const minBreadth = dailyBreadth.reduce((min, d) => Math.min(min, d.breadth), Infinity);
    const maxBreadth = dailyBreadth.reduce((max, d) => Math.max(max, d.breadth), -Infinity);
    const summary = `Breadth is ${trend}; positive sectors range from ${minBreadth} to ${maxBreadth} out of ${dailyBreadth[0] ? dailyBreadth[0].total : 0}.`;
    const evidence = rs.flatMap((r) => r.evidence);
    return { summary, details: { dailyBreadth, breadthTrend: trend }, evidence };
  }
}

/**
 * RelativeStrengthAgent computes rankings and rotation/fragility events.
 */
class RelativeStrengthAgent extends Agent {
  constructor() {
    super('relative-strength');
  }
  async run(ctx) {
    const { provider, startDate, endDate } = ctx;
    const data = await provider.loadSectorReturns(startDate, endDate);
    const rs = computeRelativeStrength(data);
    const rotationEvents = detectRotationEvents(rs);
    const fragilityEvents = computeFragilityEvents(rs);
    const latest = rs[rs.length - 1];
    const leaders = latest.ranking.slice(0, 3).map((r) => r.sector);
    const summaryParts = [];
    summaryParts.push(`Top leaders today (${latest.date}): ${leaders.join(', ')}.`);
    if (rotationEvents.length > 0) {
      const lastEvent = rotationEvents[rotationEvents.length - 1];
      summaryParts.push(
        `Recent rotation: from ${lastEvent.fromCohort} to ${lastEvent.toCohort} on ${formatDate(lastEvent.date)}.`,
      );
    }
    if (fragilityEvents.length > 0) {
      const lastFrag = fragilityEvents[fragilityEvents.length - 1];
      summaryParts.push(`Fragility alert on ${formatDate(lastFrag.date)}: ${lastFrag.description}.`);
    }
    const summary = summaryParts.join(' ');
    const evidence = rs.flatMap((r) => r.evidence);
    return {
      summary,
      details: {
        relativeStrength: rs,
        rotationEvents,
        fragilityEvents,
      },
      evidence,
    };
  }
}

/**
 * MacroContextAgent looks at the benchmark return trend as a simple proxy
 * for macro conditions.
 */
class MacroContextAgent extends Agent {
  constructor() {
    super('macro-context');
  }
  async run(ctx) {
    const { provider, startDate, endDate } = ctx;
    const data = await provider.loadSectorReturns(startDate, endDate);
    let trend = 'flat';
    if (data.length > 1) {
      const first = data[0].benchmarkReturn ?? 0;
      const last = data[data.length - 1].benchmarkReturn ?? 0;
      trend = last > first ? 'improving' : last < first ? 'deteriorating' : 'flat';
    }
    const summary = `Benchmark trend over the period is ${trend}, suggesting a ${
      trend === 'improving' ? 'risk-on' : trend === 'deteriorating' ? 'risk-off' : 'neutral'
    } macro backdrop.`;
    return { summary, details: { benchmarkTrend: trend }, evidence: [] };
  }
}

/**
 * ScepticAgent scans for data anomalies such as unusually large returns or
 * missing values.
 */
class ScepticAgent extends Agent {
  constructor() {
    super('sceptic');
  }
  async run(ctx) {
    const { provider, startDate, endDate } = ctx;
    const data = await provider.loadSectorReturns(startDate, endDate);
    const messages = [];
    data.forEach((rec) => {
      Object.entries(rec.sectorReturns).forEach(([sector, val]) => {
        if (val != null && Math.abs(val) > 0.1) {
          messages.push(`Large move detected for ${sector} on ${rec.date} (${(val * 100).toFixed(1)}%).`);
        }
        if (val == null) {
          messages.push(`Missing return for ${sector} on ${rec.date}.`);
        }
      });
    });
    const summary =
      messages.length > 0
        ? `Potential data issues detected: ${messages.join(' ')}`
        : 'No notable data anomalies.';
    return { summary, details: messages, evidence: [] };
  }
}

/**
 * SynthesisAgent orchestrates multiple agents and composes their summaries into
 * a single narrative.  It concatenates summaries and aggregates evidence.
 */
class SynthesisAgent extends Agent {
  constructor(agents) {
    super('synthesis');
    this.agents = agents;
  }
  async run(ctx) {
    const results = await Promise.all(this.agents.map((agent) => agent.run(ctx)));
    const briefParts = [];
    const evidence = [];
    results.forEach((res) => {
      briefParts.push(`[${res.summary}]`);
      evidence.push(...res.evidence);
    });
    const narrative = briefParts.join(' ');
    return { summary: narrative, details: results.map((r) => r.details), evidence };
  }
}

module.exports = {
  Agent,
  BreadthAgent,
  RelativeStrengthAgent,
  MacroContextAgent,
  ScepticAgent,
  SynthesisAgent,
  formatDate,
};