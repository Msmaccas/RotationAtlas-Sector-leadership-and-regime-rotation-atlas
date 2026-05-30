import { FixtureDataProvider } from '@rotationatlas/data';
import {
  computeRelativeStrength,
  detectRotationEvents,
  computeFragilityEvents,
  RelativeStrengthResult,
} from '@rotationatlas/core/dist/rotation';
import { EvidenceRecord } from '@rotationatlas/core/dist/models';
import { format } from 'date-fns';

export interface AgentResult {
  summary: string;
  details: any;
  evidence: EvidenceRecord[];
}

export interface AgentContext {
  provider: FixtureDataProvider;
  startDate: Date;
  endDate: Date;
}

export abstract class Agent {
  constructor(public name: string) {}
  abstract run(ctx: AgentContext): Promise<AgentResult>;
}

/**
 * BreadthAgent analyses how many sectors are outperforming the benchmark each day
 * and whether the participation in leadership is broad or narrow.
 */
export class BreadthAgent extends Agent {
  constructor() {
    super('breadth');
  }
  async run(ctx: AgentContext): Promise<AgentResult> {
    const { provider, startDate, endDate } = ctx;
    const data = await provider.loadSectorReturns(startDate, endDate);
    const rs = computeRelativeStrength(data);
    const dailyBreadth: { date: string; breadth: number; total: number }[] = [];
    rs.forEach((r) => {
      const positive = r.ranking.filter((item) => item.value > 1).length;
      dailyBreadth.push({ date: r.date, breadth: positive, total: r.ranking.length });
    });
    // Summarise
    let trend = 'stable';
    if (dailyBreadth.length > 1) {
      const first = dailyBreadth[0].breadth / dailyBreadth[0].total;
      const last = dailyBreadth[dailyBreadth.length - 1].breadth / dailyBreadth[dailyBreadth.length - 1].total;
      trend = last > first ? 'expanding' : last < first ? 'contracting' : 'stable';
    }
    const summary = `Breadth is ${trend}; positive sectors range from ${Math.min(...dailyBreadth.map((d) => d.breadth))} to ${Math.max(...dailyBreadth.map((d) => d.breadth))} out of ${dailyBreadth[0]?.total || 0}.`;
    const evidence = rs.flatMap((r) => r.evidence);
    return { summary, details: dailyBreadth, evidence };
  }
}

/**
 * RelativeStrengthAgent computes rankings and rotation/fragility events.
 */
export class RelativeStrengthAgent extends Agent {
  constructor() {
    super('relative-strength');
  }
  async run(ctx: AgentContext): Promise<AgentResult> {
    const { provider, startDate, endDate } = ctx;
    const data = await provider.loadSectorReturns(startDate, endDate);
    const rs = computeRelativeStrength(data);
    const rotationEvents = detectRotationEvents(rs);
    const fragilityEvents = computeFragilityEvents(rs);
    // Build narrative summary
    const latest = rs[rs.length - 1];
    const leaders = latest.ranking.slice(0, 3).map((r) => r.sector);
    const summaryParts: string[] = [];
    summaryParts.push(`Top leaders today (${format(new Date(latest.date), 'yyyy-MM-dd')}): ${leaders.join(', ')}.`);
    if (rotationEvents.length > 0) {
      const lastEvent = rotationEvents[rotationEvents.length - 1];
      summaryParts.push(`Recent rotation: from ${lastEvent.fromCohort} to ${lastEvent.toCohort} on ${format(lastEvent.date, 'yyyy-MM-dd')}.`);
    }
    if (fragilityEvents.length > 0) {
      const lastFrag = fragilityEvents[fragilityEvents.length - 1];
      summaryParts.push(`Fragility alert on ${format(lastFrag.date, 'yyyy-MM-dd')}: ${lastFrag.description}.`);
    }
    const summary = summaryParts.join(' ');
    const evidence = rs.flatMap((r) => r.evidence);
    return { summary, details: { relativeStrength: rs, rotationEvents, fragilityEvents }, evidence };
  }
}

/**
 * MacroContextAgent provides macro commentary using proxy data. This is a stub
 * that could be extended to integrate economic data sources. It currently
 * examines the benchmark returns trend as a proxy for risk appetite.
 */
export class MacroContextAgent extends Agent {
  constructor() {
    super('macro-context');
  }
  async run(ctx: AgentContext): Promise<AgentResult> {
    const { provider, startDate, endDate } = ctx;
    const data = await provider.loadSectorReturns(startDate, endDate);
    // Use benchmark trend as macro proxy
    let trend = 'flat';
    if (data.length > 1) {
      const first = data[0].benchmarkReturn ?? 0;
      const last = data[data.length - 1].benchmarkReturn ?? 0;
      trend = last > first ? 'improving' : last < first ? 'deteriorating' : 'flat';
    }
    const summary = `Benchmark trend over the period is ${trend}, suggesting a ${trend === 'improving' ? 'risk-on' : trend === 'deteriorating' ? 'risk-off' : 'neutral'} macro backdrop.`;
    return { summary, details: { benchmarkTrend: trend }, evidence: [] };
  }
}

/**
 * ScepticAgent flags data quality issues or anomalies requiring manual review.
 */
export class ScepticAgent extends Agent {
  constructor() {
    super('sceptic');
  }
  async run(ctx: AgentContext): Promise<AgentResult> {
    const { provider, startDate, endDate } = ctx;
    const data = await provider.loadSectorReturns(startDate, endDate);
    const messages: string[] = [];
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
    const summary = messages.length > 0 ? `Potential data issues detected: ${messages.join(' ')}` : 'No notable data anomalies.';
    return { summary, details: messages, evidence: [] };
  }
}

/**
 * SynthesisAgent orchestrates the other agents and produces a comprehensive
 * narrative and structured report. It should be run after the other agents.
 */
export class SynthesisAgent extends Agent {
  private agents: Agent[];
  constructor(agents: Agent[]) {
    super('synthesis');
    this.agents = agents;
  }
  async run(ctx: AgentContext): Promise<AgentResult> {
    const results = await Promise.all(this.agents.map((agent) => agent.run(ctx)));
    // Build sections
    const briefParts: string[] = [];
    const evidence: EvidenceRecord[] = [];
    results.forEach((res) => {
      briefParts.push(`[${res.summary}]`);
      evidence.push(...res.evidence);
    });
    const narrative = briefParts.join(' ');
    return { summary: narrative, details: results.map((r) => r.details), evidence };
  }
}