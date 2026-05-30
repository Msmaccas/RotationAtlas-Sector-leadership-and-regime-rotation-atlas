/**
 * Background worker for RotationAtlas.  This script runs a daily analysis of
 * sector rotation and writes a JSON brief to the reports directory.  It
 * computes a simple change summary versus the previous run (leader changes).
 * Scheduling is handled without external dependencies – the worker sleeps
 * until 06:00 each day.
 */
const fs = require('node:fs');
const path = require('node:path');
// Use relative imports so the worker can run without installing workspaces.
const { FixtureDataProvider } = require('../data');
const {
  BreadthAgent,
  RelativeStrengthAgent,
  MacroContextAgent,
  ScepticAgent,
  SynthesisAgent,
} = require('../agents');

const provider = new FixtureDataProvider();
const reportsDir = path.join(__dirname, '..', '..', 'reports');

/** Ensure that the reports directory exists. */
function ensureReportsDir() {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
}

/**
 * Compute a change summary comparing the new result with the most recent
 * previous report.  Currently only detects a change in the top leader.
 *
 * @param {Object} currentResult
 * @param {string} currentDateStr
 * @returns {Object} Change summary
 */
function computeChangeSummary(currentResult, currentDateStr) {
  const summary = { date: currentDateStr, changes: [] };
  try {
    const files = fs.readdirSync(reportsDir).filter((f) => f.startsWith('brief_') && f.endsWith('.json'));
    if (files.length === 0) return summary;
    files.sort();
    const lastFile = files[files.length - 1];
    const prev = JSON.parse(fs.readFileSync(path.join(reportsDir, lastFile), 'utf8'));
    const prevRsArray = prev.details && prev.details[1] && prev.details[1].relativeStrength;
    const curRsArray = currentResult.details && currentResult.details[1] && currentResult.details[1].relativeStrength;
    if (Array.isArray(prevRsArray) && prevRsArray.length > 0 && Array.isArray(curRsArray) && curRsArray.length > 0) {
      const prevTop = prevRsArray[prevRsArray.length - 1].ranking[0] && prevRsArray[prevRsArray.length - 1].ranking[0].sector;
      const curTop = curRsArray[curRsArray.length - 1].ranking[0] && curRsArray[curRsArray.length - 1].ranking[0].sector;
      if (prevTop && curTop && prevTop !== curTop) {
        summary.changes.push(`Top leader changed from ${prevTop} to ${curTop}`);
      }
    }
  } catch (err) {
    // ignore errors computing change summary
  }
  return summary;
}

/**
 * Run a daily analysis using the synthesis agent and write the result to a
 * JSON file in the reports directory with a date-based filename.
 */
async function runDailyAnalysis() {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 1000 * 60 * 60 * 24 * 30); // last 30 days
  const synthesis = new SynthesisAgent([
    new BreadthAgent(),
    new RelativeStrengthAgent(),
    new MacroContextAgent(),
    new ScepticAgent(),
  ]);
  const result = await synthesis.run({ provider, startDate, endDate });
  const dateString = endDate.toISOString().split('T')[0];
  const changeSummary = computeChangeSummary(result, dateString);
  const reportWithChanges = { ...result, changeSummary };
  const fileName = path.join(reportsDir, `brief_${dateString}.json`);
  fs.writeFileSync(fileName, JSON.stringify(reportWithChanges, null, 2), 'utf8');
  console.log('RotationAtlas worker wrote report:', fileName);
}

/**
 * Schedule the next run at 06:00 local time.  After running, it will
 * schedule the subsequent run, so the function recurs indefinitely.
 */
function scheduleNextRun() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(6, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  const delay = next.getTime() - now.getTime();
  setTimeout(async () => {
    try {
      await runDailyAnalysis();
    } catch (err) {
      console.error('Error running daily analysis:', err);
    }
    scheduleNextRun();
  }, delay);
}

// Start the worker
function start() {
  ensureReportsDir();
  runDailyAnalysis().catch((err) => console.error('Initial run error:', err));
  scheduleNextRun();
}

start();