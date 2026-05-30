import cron from 'node-cron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { FixtureDataProvider } from '@rotationatlas/data';
import { BreadthAgent, RelativeStrengthAgent, MacroContextAgent, ScepticAgent, SynthesisAgent } from '@rotationatlas/agents';

const provider = new FixtureDataProvider();
const reportsDir = path.join(__dirname, '../../..', 'reports');

async function ensureReportsDir() {
  try {
    await fs.mkdir(reportsDir, { recursive: true });
  } catch (err) {
    // ignore
  }
}

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
  // compute change feed versus previous report if it exists
  const dateString = endDate.toISOString().split('T')[0];
  const fileName = path.join(reportsDir, `brief_${dateString}.json`);
  let changeSummary: any = { date: dateString, changes: [] };
  try {
    const files = await fs.readdir(reportsDir);
    // find the most recent report before today
    const previousFiles = files
      .filter((f) => f.startsWith('brief_') && f !== `brief_${dateString}.json`)
      .sort();
    if (previousFiles.length > 0) {
      const lastFile = previousFiles[previousFiles.length - 1];
      const prev = JSON.parse(await fs.readFile(path.join(reportsDir, lastFile), 'utf8'));
      // Compare top leader
      const prevRsArray = prev.details && prev.details[1]?.relativeStrength;
      const curRsArray = result.details && (result as any).details[1]?.relativeStrength;
      if (Array.isArray(prevRsArray) && prevRsArray.length > 0 && Array.isArray(curRsArray) && curRsArray.length > 0) {
        const prevTop = prevRsArray[prevRsArray.length - 1].ranking[0]?.sector;
        const curTop = curRsArray[curRsArray.length - 1].ranking[0]?.sector;
        if (prevTop && curTop && prevTop !== curTop) {
          changeSummary.changes.push(`Top leader changed from ${prevTop} to ${curTop}`);
        }
      }
      // Compare breadth trend
      const prevBreadthTrend = prev.details?.[0]?.breadthTrend;
      const curBreadthTrend = undefined;
      // Additional comparisons could be added here
    }
  } catch (err) {
    // ignore errors when computing change summary
  }
  const reportWithChanges = { ...result, changeSummary };
  await fs.writeFile(fileName, JSON.stringify(reportWithChanges, null, 2), 'utf8');
  console.log('RotationAtlas worker wrote report:', fileName);
}

async function start() {
  await ensureReportsDir();
  console.log('Starting RotationAtlas worker');
  // run immediately on startup
  await runDailyAnalysis();
  // schedule to run every day at 6:00am
  cron.schedule('0 6 * * *', async () => {
    await runDailyAnalysis();
  });
}

start().catch((err) => {
  console.error('Worker error', err);
});