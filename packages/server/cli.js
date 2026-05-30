#!/usr/bin/env node
/**
 * CLI script to run a one‑off morning brief.  It accepts optional start
 * and end dates as command line arguments.  The result is printed to
 * stdout.  This script exercises the same agents used by the API server.
 */
// Use relative imports for workspace‑free execution.
const { FixtureDataProvider } = require('../data');
const {
  BreadthAgent,
  RelativeStrengthAgent,
  MacroContextAgent,
  ScepticAgent,
  SynthesisAgent,
} = require('../agents');

async function run() {
  const provider = new FixtureDataProvider();
  const args = process.argv.slice(2);
  const startDate = args[0] ? new Date(args[0]) : new Date('2026-05-20');
  const endDate = args[1] ? new Date(args[1]) : new Date('2026-05-29');
  const synthesis = new SynthesisAgent([
    new BreadthAgent(),
    new RelativeStrengthAgent(),
    new MacroContextAgent(),
    new ScepticAgent(),
  ]);
  const result = await synthesis.run({ provider, startDate, endDate });
  console.log('RotationAtlas Morning Brief');
  console.log('========================================');
  console.log(result.summary);
  console.log('\nEvidence count:', result.evidence.length);
}

run().catch((err) => {
  console.error('Error running CLI:', err);
});