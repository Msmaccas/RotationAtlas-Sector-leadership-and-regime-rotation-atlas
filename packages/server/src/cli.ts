#!/usr/bin/env node
import { FixtureDataProvider } from '@rotationatlas/data';
import { BreadthAgent, RelativeStrengthAgent, MacroContextAgent, ScepticAgent, SynthesisAgent } from '@rotationatlas/agents';

async function run() {
  const provider = new FixtureDataProvider();
  const startDate = new Date(process.argv[2] || '2026-05-20');
  const endDate = new Date(process.argv[3] || '2026-05-29');
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
  console.error('Error running smoke test', err);
});