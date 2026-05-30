# RotationAtlas Demonstration

This demo walks through the smoke path for RotationAtlas.  It shows how to seed fixture data, run the multi‑agent workflow, view the morning brief and inspect the evidence ledger.  Future iterations will include a web dashboard.

## 1. Clone

```sh
git clone <repo-url>
cd rotation-atlas
```

## 2. Build packages

No build step is required because the code is plain JavaScript.  The `build` script is a no‑op provided for compatibility.

## 3. Generate the morning brief (smoke test)

Run the CLI without arguments to process the default fixture data (10 days in May 2026):

```sh
npm run smoke
```

Example output:

```
RotationAtlas Morning Brief
========================================
[Breadth is expanding; positive sectors range from 2 to 5 out of 6.] [Top leaders today (2026-05-29): XLK, XLE, XLY. Recent rotation: from XLK to XLF on 2026-05-22. Fragility alert on 2026-05-25: Fragility detected: top 1 sectors account for 57.1% of relative strength.] [Benchmark trend over the period is improving, suggesting a risk-on macro backdrop.] [No notable data anomalies.]

Evidence count: 60
```

The narrative comprises four bracketed sections corresponding to the breadth, relative strength/rotation, macro context and sceptic agents.  The evidence count indicates how many underlying observations contributed to the analysis.

## 4. Query the API

Start the API server:

```sh
npm start
```

Then, from another terminal or using `curl`, query endpoints:

```sh
curl 'http://localhost:3000/api/brief?startDate=2026-05-20&endDate=2026-05-29' | jq .summary

curl 'http://localhost:3000/api/sector-board?startDate=2026-05-20&endDate=2026-05-29' | jq '.[-1]'

curl 'http://localhost:3000/api/rotation-events?startDate=2026-05-20&endDate=2026-05-29'
```

These endpoints return JSON describing the morning brief, the sequence of relative‑strength rankings and the rotation events detected over the period.

## 5. View reports from the worker

Run the worker to generate daily reports into the `reports/` directory:

```sh
npm start -w packages/worker
```

This will immediately write a JSON report named `brief_<date>.json` and schedule a new report every day at 06:00 local time.  Inspect the report:

```sh
cat reports/brief_2026-05-29.json | jq .summary
```

## 6. Python sidecar usage

If you wish to compute a correlation matrix of sector returns using the Python sidecar, first install dependencies:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r packages/python/requirements.txt
```

Then run:

```sh
python packages/python/calc.py fixtures/sector_returns.csv -o correlation.csv
cat correlation.csv
```

This produces a correlation matrix of the sample sector returns and saves it to `correlation.csv`.

## 7. Next steps

The current demo focuses on the back‑end analytics.  A future version will implement the front‑end dashboard in `packages/dashboard` to visualise rotation trees, change panels and evidence ledgers.  Feel free to explore the code and extend the providers, agents or UI.