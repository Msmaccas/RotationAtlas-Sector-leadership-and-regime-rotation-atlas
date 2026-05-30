import express from 'express';
import bodyParser from 'body-parser';
import { FixtureDataProvider } from '@rotationatlas/data';
import { BreadthAgent, RelativeStrengthAgent, MacroContextAgent, ScepticAgent, SynthesisAgent } from '@rotationatlas/agents';

const app = express();
app.use(bodyParser.json());

const provider = new FixtureDataProvider();

function parseDates(req: express.Request) {
  const start = req.query.startDate as string | undefined;
  const end = req.query.endDate as string | undefined;
  const startDate = start ? new Date(start) : new Date('1970-01-01');
  const endDate = end ? new Date(end) : new Date();
  return { startDate, endDate };
}

app.get('/api/brief', async (req, res) => {
  try {
    const { startDate, endDate } = parseDates(req);
    const synthesis = new SynthesisAgent([
      new BreadthAgent(),
      new RelativeStrengthAgent(),
      new MacroContextAgent(),
      new ScepticAgent(),
    ]);
    const result = await synthesis.run({ provider, startDate, endDate });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sector-board', async (req, res) => {
  try {
    const { startDate, endDate } = parseDates(req);
    const rsAgent = new RelativeStrengthAgent();
    const result = await rsAgent.run({ provider, startDate, endDate });
    res.json(result.details.relativeStrength);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/rotation-events', async (req, res) => {
  try {
    const { startDate, endDate } = parseDates(req);
    const rsAgent = new RelativeStrengthAgent();
    const result = await rsAgent.run({ provider, startDate, endDate });
    res.json(result.details.rotationEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`RotationAtlas server listening on port ${port}`);
});