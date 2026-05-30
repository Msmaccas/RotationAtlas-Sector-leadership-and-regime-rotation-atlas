# RotationAtlas

**RotationAtlas** is a cross‑market rotation intelligence platform that helps investment teams identify leadership migration before the crowd notices.  Unlike traditional dashboards or back‑testing engines, it continuously ingests sector ETFs, industry groups, breadth indicators, macro proxies and style factors to label market regimes, track leadership cohorts, detect fragility events and narrate what changed across multiple horizons.  This repository is implemented with plain Node.js modules to avoid external build dependencies and includes a Python sidecar for matrix‑heavy calculations and a multi‑agent workflow for analysis.

## Use case

Portfolio managers, sector rotation PMs and macro traders often struggle to see where leadership is migrating until after the move is priced in.  RotationAtlas addresses this by:

* Computing **relative strength** of sectors and industries against a benchmark to rank leaders and laggards.
* Measuring **breadth** to understand how many constituents are participating in a move and whether leadership is narrowing.
* Capturing **rotation and fragility events** when leadership transitions or becomes concentrated.
* Providing **macro context** using benchmark trends and proxies (e.g. rates, commodities, style factors).
* Generating a **morning brief**, a sector board, an industry drill‑down and a narrative explaining why leadership changed.

## Project structure

This monorepo uses npm workspaces to organise packages:

* **packages/core** – domain models and analytics functions (relative strength, rotation detection, fragility assessment) implemented in plain JavaScript.
* **packages/data** – data ingestion and caching; reads fixture CSVs and is designed to plug into external data vendors.
* **packages/agents** – multi‑agent framework including breadth, relative strength, macro context, sceptic and synthesis agents.
* **packages/server** – HTTP API server and CLI built using the Node.js standard library.  Exposes endpoints for the morning brief, sector board and rotation events.
* **packages/worker** – background scheduler that runs daily analysis and writes reports to the `reports/` directory using only built‑in timing functions.
* **packages/python** – Python sidecar for matrix‑heavy calculations (e.g. correlation matrices).  Demonstrates integration with pandas and NumPy.
* **fixtures/** – deterministic sample data for unit tests and the smoke path.  Replace with live data providers via environment variables.
* **research/** – competitor analysis and benchmarking documents.

## Installation

Requirements:

* Node.js ≥ 18 (tested with Node 18 and 20).
* Python ≥ 3.10 (for the Python sidecar, optional).

Clone the repository and install Python dependencies if you intend to use the Python sidecar:

```sh
git clone <repo-url>
cd rotation-atlas
python -m venv .venv  # optional
source .venv/bin/activate
pip install -r packages/python/requirements.txt
```

## Build

The implementation uses plain JavaScript modules and does not require a build step.  The `build` script is a no‑op provided for compatibility with CI pipelines.

## Test

Run unit and integration tests:

```sh
npm test
```

The test runner uses Node’s built‑in `assert` module and verifies relative strength calculations, rotation detection, fragility assessment and agent orchestration.

## Smoke test

The smoke path seeds fixtures, runs a full rotation computation and outputs a morning brief via the CLI.  From a clean clone:

```sh
npm run smoke
```

This command invokes the CLI defined in `packages/server/cli.js` which runs the synthesis agent on the sample data between `2026‑05‑20` and `2026‑05‑29`, prints the brief to stdout and reports the number of evidence items.

## Start the API

To start the HTTP server:

```sh
npm start
```

The server will listen on `PORT` (default 3000).  Available endpoints:

* `GET /api/brief?startDate=YYYY‑MM‑DD&endDate=YYYY‑MM‑DD` – returns the morning brief and evidence.
* `GET /api/sector-board?startDate=YYYY‑MM‑DD&endDate=YYYY‑MM‑DD` – returns relative‑strength rankings over the period.
* `GET /api/rotation-events?startDate=YYYY‑MM‑DD&endDate=YYYY‑MM‑DD` – returns detected rotation events.

## Run the worker

The worker schedules daily analyses and writes JSON reports to `reports/brief_<date>.json`.  To run it manually:

```sh
npm run smoke -w packages/worker
```

Or start the worker process (which will run immediately and schedule future runs at 06:00 local time):

```sh
npm run start -w packages/worker
```

## Environment variables

RotationAtlas uses environment variables for configuration.  The following variables are recognised:

| Variable | Purpose | Default |
|---------|---------|---------|
| `PORT` | HTTP port for the API server | `3000` |
| `FIXTURE_PATH` | Path to the CSV file used by `FixtureDataProvider` | `fixtures/sector_returns.csv` |

You can extend the data layer by implementing your own provider that reads from proprietary APIs, with credentials loaded via environment variables.

## Limitations

* **Sample data only** – The initial implementation uses deterministic fixture data.  Live deployment requires connecting to real‑world data sources (e.g. ETF price feeds, macro proxies, style factors).  Provider interfaces are designed for extension.
* **Simplified analytics** – Relative strength, rotation detection and fragility calculations use straightforward ratios and thresholds.  Production‑grade analytics would incorporate more robust statistical methods and factor models.
* **Narrative generation** – The narrative generator currently concatenates summaries from each agent.  Future versions could use natural‑language generation models to produce more fluent reports.
* **No UI yet** – A web dashboard package is scaffolded but not implemented in this version.  Visualisation and interactive drill‑downs are planned for a subsequent iteration.
* **Not investment advice** – RotationAtlas is a research tool.  It does not provide trading recommendations or guarantee predictive accuracy.

## Contributing

Pull requests are welcome.  Please run `npm run build`, `npm test` and ensure the smoke test passes before submitting.