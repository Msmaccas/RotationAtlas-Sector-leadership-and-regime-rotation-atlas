import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { SectorReturnRecord } from '@rotationatlas/core/dist/rotation';

/**
 * A simple local file based data provider. In a real application this module
 * would integrate with data vendors to pull sector ETF returns, index breadth,
 * and macro proxies. For the purposes of this project it reads deterministic
 * fixture files from the `fixtures` directory. Fixtures should be stored as
 * CSV with columns: date, benchmark, <sector codes...>.
 */
export class FixtureDataProvider {
  private fixturePath: string;

  constructor(fixturePath?: string) {
    // Use explicit parameter, environment variable or default fixture path
    const envPath = process.env.FIXTURE_PATH;
    this.fixturePath = fixturePath || (envPath ? path.resolve(envPath) : path.join(__dirname, '../../..', 'fixtures', 'sector_returns.csv'));
  }

  async loadSectorReturns(startDate?: Date, endDate?: Date): Promise<SectorReturnRecord[]> {
    const csvText = await fs.readFile(this.fixturePath, 'utf8');
    const records = parse(csvText, { columns: true, skip_empty_lines: true });
    const results: SectorReturnRecord[] = [];
    for (const row of records) {
      const date = new Date(row.date);
      if (startDate && date < startDate) continue;
      if (endDate && date > endDate) continue;
      const sectorReturns: Record<string, number | null> = {};
      Object.keys(row).forEach((key) => {
        if (key === 'date' || key === 'benchmark') return;
        const val = row[key];
        sectorReturns[key] = val !== '' ? parseFloat(val) : null;
      });
      const benchmarkReturn = row.benchmark !== '' ? parseFloat(row.benchmark) : null;
      results.push({ date: row.date, sectorReturns, benchmarkReturn });
    }
    return results;
  }
}

export async function loadDemoData(): Promise<SectorReturnRecord[]> {
  const provider = new FixtureDataProvider();
  return provider.loadSectorReturns();
}