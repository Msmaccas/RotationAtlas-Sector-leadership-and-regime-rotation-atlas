# Agents Operational Guide

RotationAtlas uses a multi‑agent architecture to decompose market‑rotation analysis into specialised tasks.  Each agent operates autonomously on the shared data layer and emits evidence records with confidence levels.  The synthesis agent orchestrates these contributions into a coherent narrative.  This document describes the roles, operational rules and criteria for running, building, verifying and declaring work done.

## Agents overview

| Agent | Responsibility | Key outputs |
|------|---------------|-------------|
| **BreadthAgent** | Computes participation breadth by counting how many sectors outperform the benchmark each period. | Daily breadth metrics and a trend descriptor (expanding, contracting or stable). |
| **RelativeStrengthAgent** | Calculates relative‑strength rankings, detects rotation events when the top leader changes and flags fragility when leadership becomes concentrated. | Ranked lists of sectors, rotation events and fragility events. |
| **MacroContextAgent** | Provides macro context by examining benchmark trends and proxies. | A simple macro sentiment (risk‑on, risk‑off or neutral) and supporting data. |
| **ScepticAgent** | Checks for data quality issues such as missing values or unusually large moves. | List of warnings requiring manual review. |
| **SynthesisAgent** | Invokes the other agents, aggregates their summaries and evidence, and composes the morning brief, sector board, drill‑down and change narratives. | A structured report with narrative text, evidence ledger and detailed outputs from sub‑agents. |

## Running the agents

Agents live in the `@rotationatlas/agents` package.  They accept a context object containing a data provider and date range.  For example:

```js
const { FixtureDataProvider } = require('@rotationatlas/data');
const { BreadthAgent, RelativeStrengthAgent } = require('@rotationatlas/agents');

const provider = new FixtureDataProvider();
const ctx = { provider, startDate: new Date('2026-05-20'), endDate: new Date('2026-05-29') };
const breadth = await new BreadthAgent().run(ctx);
const rs = await new RelativeStrengthAgent().run(ctx);
```

To produce a full report, use the `SynthesisAgent` with the individual agents:

```js
const { BreadthAgent, RelativeStrengthAgent, MacroContextAgent, ScepticAgent, SynthesisAgent } = require('@rotationatlas/agents');

const synthesis = new SynthesisAgent([
  new BreadthAgent(),
  new RelativeStrengthAgent(),
  new MacroContextAgent(),
  new ScepticAgent(),
]);
const report = await synthesis.run(ctx);
```

## Build and verify

1. **Build** – A build step is unnecessary because the packages are written in plain JavaScript.  The `build` script is a no‑op.
2. **Test** – Run `npm test` to execute unit and integration tests.  Tests verify relative strength calculations, rotation detection, fragility assessment and agent orchestration.
3. **Smoke** – Run `npm run smoke` to perform an end‑to‑end exercise.  This uses the CLI in `@rotationatlas/server` to generate a morning brief from the fixture data and prints the result.  It must complete without errors.
4. **Run** – Start the API via `npm start` or the worker via `npm start -w packages/worker`.  Ensure the endpoints return valid JSON and that reports appear in the `reports/` directory.

## Done criteria

The project is considered **done** when the following criteria are met:

1. **One‑command smoke path** works from a clean clone using only `npm ci`, `npm run build`, `npm run smoke`, `npm start` and `npm test`.
2. **Installation and build** succeed with Node 18+ and no additional tools (except optional Python environment for matrix calculations).
3. **Tests** cover critical scenarios including factor bucketing, ranking stability, state transitions, missing data handling, and narrative generation.
4. **Reports** – The worker writes a daily JSON report containing the morning brief, sector board and evidence ledger.  Each evidence record includes the data source, timestamp, confidence level and missing‑data reason when applicable.
5. **Change feed** – Reports include a comparison versus the previous run (when available) highlighting changes in leaders, laggards, breadth and macro context.
6. **Environment variables** – All configurable parameters (e.g. port, fixture path) are exposed via environment variables.  No secrets are hard‑coded.
7. **Least‑privilege CI** – The GitHub Actions workflow uses `actions/setup-node` with `contents: read` permissions and runs build, test and smoke scripts.
8. **Documentation** – README.md, PRODUCT.md, DEMO.md, PRICING.md and research documents are complete and explain limitations and usage clearly.  No claims are made about predictive accuracy or investment performance.