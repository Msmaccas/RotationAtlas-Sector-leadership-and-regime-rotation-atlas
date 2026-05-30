#!/usr/bin/env node
/*
 * Lightweight test runner for RotationAtlas.  This script uses Node's
 * built‑in assert module to verify core analytics, agents and worker logic.
 * It does not rely on any external test framework.  If any assertion
 * fails, the script will throw and exit with a non‑zero status code.
 */
const assert = require('assert');
const {
  computeRelativeStrength,
  detectRotationEvents,
  computeFragilityEvents,
} = require('../packages/core/rotation');
const {
  BreadthAgent,
  RelativeStrengthAgent,
  MacroContextAgent,
  ScepticAgent,
  SynthesisAgent,
} = require('../packages/agents');
const { FixtureDataProvider } = require('../packages/data');

async function testCoreAnalytics() {
  const data = [
    {
      date: '2026-05-01',
      sectorReturns: { XLE: 0.02, XLK: 0.03, XLF: 0.01 },
      benchmarkReturn: 0.015,
    },
    {
      date: '2026-05-02',
      sectorReturns: { XLE: 0.01, XLK: 0.02, XLF: 0.03 },
      benchmarkReturn: 0.015,
    },
  ];
  const rs = computeRelativeStrength(data);
  assert.strictEqual(rs.length, 2, 'Relative strength results length');
  assert.strictEqual(rs[0].ranking[0].sector, 'XLK', 'Initial top leader should be XLK');
  const events = detectRotationEvents(rs);
  assert.strictEqual(events.length, 1, 'Should detect one rotation event');
  assert.strictEqual(events[0].fromCohort, 'XLK', 'Rotation from XLK');
  assert.strictEqual(events[0].toCohort, 'XLF', 'Rotation to XLF');
  // Use a lower concentration threshold to ensure fragility is detected in this toy dataset.
  const fragility = computeFragilityEvents(rs, 0.49, 1);
  assert.ok(fragility.length >= 1, 'Fragility event should be detected with threshold 0.49');
}

async function testAgents() {
  const provider = new FixtureDataProvider();
  const start = new Date('2026-05-20');
  const end = new Date('2026-05-23');
  const breadth = new BreadthAgent();
  const breadthRes = await breadth.run({ provider, startDate: start, endDate: end });
  assert.ok(
    typeof breadthRes.summary === 'string' && breadthRes.summary.includes('Breadth'),
    'BreadthAgent should produce a summary containing the word Breadth',
  );
  const rsAgent = new RelativeStrengthAgent();
  const rsRes = await rsAgent.run({ provider, startDate: start, endDate: end });
  assert.ok(rsRes.details.relativeStrength.length > 0, 'RelativeStrengthAgent returns rankings');
  const synthesis = new SynthesisAgent([
    new BreadthAgent(),
    new RelativeStrengthAgent(),
    new MacroContextAgent(),
    new ScepticAgent(),
  ]);
  const synthRes = await synthesis.run({ provider, startDate: start, endDate: end });
  assert.ok(synthRes.summary.length > 0, 'SynthesisAgent should produce a non‑empty narrative');
}

async function runAll() {
  await testCoreAnalytics();
  await testAgents();
  console.log('All tests passed');
}

runAll().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});