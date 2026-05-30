# RotationAtlas Product Overview

## Vision

Investment teams are flooded with data and dashboards but still miss the early signs of leadership migration.  **RotationAtlas** delivers a focused rotation intelligence layer that surfaces who is taking over from whom, why it matters, and how confident we can be.  By combining multi‑agent analytics, robust evidence ledgers and an extensible architecture, RotationAtlas fills the gap between static charts and full trading platforms.

## Key features

### Cross‑market rotation detection

RotationAtlas ingests time‑series from sector ETFs, industry groups, macro proxies (rates, commodities) and style factors to compute relative strength and identify regime transitions.  It detects when leadership moves from cyclicals to defensives, when large‑cap tech narrows to a handful of names or when energy re‑accelerates off macro surprises.  Results are presented with explicit confidence levels and missing‑data reasons.

### Breadth and fragility analysis

Breadth metrics show whether a move is supported by many constituents or driven by a few mega‑caps.  Fragility events flag when the top N sectors account for an outsized share of relative strength, signalling a narrow and potentially unsustainable leadership.  These signals help managers avoid false positives and gauge the robustness of trends.

### Multi‑agent workflow

Specialised agents handle different aspects of the analysis: BreadthAgent counts participation, RelativeStrengthAgent ranks leaders and detects rotations, MacroContextAgent provides context, ScepticAgent checks data quality and SynthesisAgent combines everything into a narrative.  This architecture encourages modularity and future expansion (e.g. adding a sentiment agent).

### Evidence ledger with uncertainty states

Every metric and event is backed by evidence records containing the data source, timestamp, value, confidence level and missing‑data explanation.  Confidence states include **UNKNOWN**, **NOT_AVAILABLE**, **LOW_CONFIDENCE**, **MANUAL_REVIEW** and **OK**.  Users can trace the origin of each conclusion and understand where manual intervention is required.

### Manager‑friendly narrative generation

RotationAtlas summarises its findings into a morning brief, sector board, industry drill‑down and “leadership changed because…” memo.  A change‑feed panel highlights what’s new versus yesterday, a week ago and a month ago, while a “why your old thesis is stale” panel flags when leadership fragility undermines previous narratives.  Reports are structured and machine‑readable for downstream use.

### Extensible architecture

Built as a modular Node.js monorepo with a Python sidecar, RotationAtlas provides a single pipeline powering the CLI, API, worker and (future) dashboard.  The implementation uses plain JavaScript to minimise external dependencies while preserving extensibility.  Data providers, agents and reporting modules are pluggable and configured via environment variables.  A web dashboard package is scaffolded for future UI work.

## Differentiation

* **Sector‑to‑industry drill‑down** – While competitors deliver broad analytics, RotationAtlas drills into industry groups and leaders/laggards within each sector, supporting CAN SLIM‑style operators and macro PMs alike.
* **Causal explanation** – By linking breadth, macro proxies and fragility into the narrative, RotationAtlas explains why leadership changed, not just that it changed.
* **Change‑over‑time narration** – The platform automatically compares the current run to previous runs and surfaces differences across multiple horizons.  This contrasts with tools that require users to manually scroll through charts.
* **Evidence‑first** – Inspired by Hebbia’s sentence‑level citations【126663115692038†L292-L309】 and OpenBB’s secure agent integration【477385175529777†L81-L118】, RotationAtlas provides per‑item evidence ledgers and never hides uncertainty.

## Roadmap

1. **Dashboard** – Build the React front‑end to visualise the rotation tree, change panels and evidence ledger interactively.
2. **Global expansion** – Extend the data layer to support international symbols and cross‑asset rotation via modular provider interfaces.
3. **Advanced analytics** – Integrate factor models, rolling beta analysis and machine‑learning classifiers via the Python sidecar.
4. **User feedback loop** – Add thumbs‑up/thumbs‑down feedback mechanisms to refine narrative generation, inspired by Captide’s feedback loops【89332042846569†L139-L159】.
5. **Marketplace integration** – Offer RotationAtlas reports as a widget inside agentic workspaces such as OpenBB and embed connectors for proprietary data vendors.