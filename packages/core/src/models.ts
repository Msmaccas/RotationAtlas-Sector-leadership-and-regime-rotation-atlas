/**
 * Domain models for RotationAtlas. These models encode the key entities
 * identified in the specification such as regimes, leadership cohorts,
 * rotation events, fragility events and evidence records. They do not
 * impose any specific data source but instead represent the shape of
 * information flowing through the system.
 */

export type ConfidenceLevel = 'UNKNOWN' | 'NOT_AVAILABLE' | 'LOW_CONFIDENCE' | 'MANUAL_REVIEW' | 'OK';

/**
 * A Regime captures a period of time where market behaviour can be
 * characterised by a dominant narrative (e.g., cyclicals leading defensives).
 */
export interface Regime {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  leaders: string[]; // list of sector or industry codes that lead during this regime
  laggards: string[];
  confidence: ConfidenceLevel;
}

/**
 * LeadershipCohort represents a group of tickers, sectors or industries that
 * collectively lead the market at a given point in time.
 */
export interface LeadershipCohort {
  id: string;
  constituents: string[]; // sector or industry codes
  startDate: Date;
  endDate?: Date;
  description?: string;
  evidenceIds: string[];
}

/**
 * Evidence records support or refute the presence of leadership or
 * regime transitions. They capture the data source, timestamp and
 * narrative context so that downstream reports can cite them.
 */
export interface EvidenceRecord {
  id: string;
  source: string; // description of the data source (e.g. ETF price feed)
  timestamp: Date;
  description: string;
  value: number | string | null;
  confidence: ConfidenceLevel;
  type: 'CONFIRMING' | 'DISCONFIRMING';
}

/**
 * RotationEvent captures when leadership migrates from one cohort to another.
 */
export interface RotationEvent {
  id: string;
  date: Date;
  fromCohort: string;
  toCohort: string;
  description: string;
  evidenceIds: string[];
  confidence: ConfidenceLevel;
}

/**
 * FragilityEvent represents a deterioration in breadth or the fragility of
 * leadership. This might occur when leadership concentrates into a few names.
 */
export interface FragilityEvent {
  id: string;
  date: Date;
  cohortId: string;
  description: string;
  evidenceIds: string[];
  confidence: ConfidenceLevel;
}

export interface ChangeSummary {
  date: Date;
  changes: string[];
}

/**
 * A helper to generate unique identifiers. In production one might use
 * UUIDs but here we generate simple unique strings for reproducibility.
 */
let counter = 0;
export function generateId(prefix: string = 'id'): string {
  counter += 1;
  return `${prefix}_${counter.toString().padStart(4, '0')}`;
}