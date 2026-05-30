/**
 * Simple HTTP server for RotationAtlas using the built‑in http module.  It
 * exposes three endpoints under /api: brief, sector-board and rotation-events.
 * Query parameters startDate and endDate (YYYY-MM-DD) may be provided to
 * constrain the time window.  Responses are JSON encoded.
 */
const http = require('http');
// Use relative imports so the server can run without installing workspaces.
const { FixtureDataProvider } = require('../data');
const {
  BreadthAgent,
  RelativeStrengthAgent,
  MacroContextAgent,
  ScepticAgent,
  SynthesisAgent,
} = require('../agents');

const provider = new FixtureDataProvider();

/**
 * Parse startDate and endDate from the request URL.  Defaults to a very
 * early start date and today if not provided.  Dates must be in a
 * format parseable by the Date constructor.
 *
 * @param {string} reqUrl The request URL including query
 * @returns {{startDate: Date, endDate: Date}}
 */
function parseDates(reqUrl) {
  const parsed = new URL(reqUrl, 'http://localhost');
  const startParam = parsed.searchParams.get('startDate');
  const endParam = parsed.searchParams.get('endDate');
  const startDate = startParam ? new Date(startParam) : new Date('1970-01-01');
  const endDate = endParam ? new Date(endParam) : new Date();
  return { startDate, endDate };
}

/**
 * Handle API requests.  Depending on the path, this function invokes
 * appropriate agents and returns their result in JSON format.
 *
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function handleRequest(req, res) {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    // Only accept GET requests
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }
    const { startDate, endDate } = parseDates(req.url);
    if (pathname === '/api/brief') {
      const synthesis = new SynthesisAgent([
        new BreadthAgent(),
        new RelativeStrengthAgent(),
        new MacroContextAgent(),
        new ScepticAgent(),
      ]);
      const result = await synthesis.run({ provider, startDate, endDate });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result));
      return;
    }
    if (pathname === '/api/sector-board') {
      const rsAgent = new RelativeStrengthAgent();
      const result = await rsAgent.run({ provider, startDate, endDate });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.details.relativeStrength));
      return;
    }
    if (pathname === '/api/rotation-events') {
      const rsAgent = new RelativeStrengthAgent();
      const result = await rsAgent.run({ provider, startDate, endDate });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.details.rotationEvents));
      return;
    }
    // Unknown path
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err) {
    console.error('Server error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

const server = http.createServer((req, res) => {
  // wrap async handler to catch rejected promises
  handleRequest(req, res);
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
server.listen(port, () => {
  console.log(`RotationAtlas server listening on port ${port}`);
});