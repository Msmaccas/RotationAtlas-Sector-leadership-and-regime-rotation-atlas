import { FixtureDataProvider } from './index';

describe('FixtureDataProvider', () => {
  test('loads fixture data', async () => {
    const provider = new FixtureDataProvider();
    const data = await provider.loadSectorReturns();
    expect(data.length).toBeGreaterThan(0);
    expect(Object.keys(data[0].sectorReturns).length).toBeGreaterThan(0);
  });
});