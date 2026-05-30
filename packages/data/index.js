/**
 * Data provider for RotationAtlas.  This module supplies sector return data
 * from a CSV fixture stored in the repository.  In a production setting
 * this would be replaced with adapters to external data vendors.  The
 * provider reads the CSV into simple JavaScript objects and filters by
 * optional date ranges.
 */
const fs = require('node:fs');
const path = require('node:path');

/**
 * Parse a CSV string into an array of objects.  This simple parser
 * assumes comma-separated values with a header row and no quoted fields.
 * It is sufficient for the provided fixtures but not robust against
 * unescaped commas or embedded newlines.
 *
 * @param {string} text CSV text
 * @returns {Array<Object>} Parsed rows
 */
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines.shift().split(',');
  const rows = [];
  lines.forEach((line) => {
    if (line.trim() === '') return;
    const values = line.split(',');
    const obj = {};
    header.forEach((col, i) => {
      obj[col] = values[i] ?? '';
    });
    rows.push(obj);
  });
  return rows;
}

class FixtureDataProvider {
  /**
   * @param {string} [fixturePath] Optional path to CSV file.  If not provided,
   * it looks for FIXTURE_PATH environment variable or falls back to
   * fixtures/sector_returns.csv relative to the repository root.
   */
  constructor(fixturePath) {
    const envPath = process.env.FIXTURE_PATH;
    const defaultPath = path.join(__dirname, '..', '..', 'fixtures', 'sector_returns.csv');
    this.fixturePath = fixturePath || envPath || defaultPath;
  }

  /**
   * Load sector returns between optional start and end dates.  Each record
   * includes the date, a map of sector returns and the benchmark return.
   *
   * @param {Date} [startDate]
   * @param {Date} [endDate]
   * @returns {Promise<Array<{date: string, sectorReturns: Object, benchmarkReturn: number|null}>>}
   */
  async loadSectorReturns(startDate, endDate) {
    const csvText = fs.readFileSync(this.fixturePath, 'utf8');
    const rows = parseCsv(csvText);
    const results = [];
    rows.forEach((row) => {
      const dateStr = row.date;
      const dateObj = new Date(dateStr);
      if (startDate && dateObj < startDate) return;
      if (endDate && dateObj > endDate) return;
      const sectorReturns = {};
      Object.keys(row).forEach((key) => {
        if (key === 'date' || key === 'benchmark') return;
        const valStr = row[key];
        sectorReturns[key] = valStr !== '' ? parseFloat(valStr) : null;
      });
      const benchmarkReturn = row.benchmark !== '' ? parseFloat(row.benchmark) : null;
      results.push({ date: dateStr, sectorReturns, benchmarkReturn });
    });
    return results;
  }
}

module.exports = {
  FixtureDataProvider,
};