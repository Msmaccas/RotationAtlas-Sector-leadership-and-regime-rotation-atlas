import { FixtureDataProvider } from '@rotationatlas/data';
import { BreadthAgent, RelativeStrengthAgent, MacroContextAgent, ScepticAgent, SynthesisAgent } from './agents';

describe('Agents', () => {
  const provider = new FixtureDataProvider();
  const startDate = new Date('2026-05-20');
  const endDate = new Date('2026-05-29');
  test('breadth agent summarises breadth trend', async () => {
    const agent = new BreadthAgent();
    const result = await agent.run({ provider, startDate, endDate });
    expect(typeof result.summary).toBe('string');
    expect(result.details.length).toBeGreaterThan(0);
  });
  test('relative strength agent identifies rotations', async () => {
    const agent = new RelativeStrengthAgent();
    const result = await agent.run({ provider, startDate, endDate });
    expect(result.details.relativeStrength.length).toBeGreaterThan(0);
    expect(Array.isArray(result.details.rotationEvents)).toBe(true);
  });
  test('synthesis agent composes narrative', async () => {
    const synthesis = new SynthesisAgent([
      new BreadthAgent(),
      new RelativeStrengthAgent(),
      new MacroContextAgent(),
      new ScepticAgent(),
    ]);
    const res = await synthesis.run({ provider, startDate, endDate });
    expect(res.summary).toContain('[');
  });
});