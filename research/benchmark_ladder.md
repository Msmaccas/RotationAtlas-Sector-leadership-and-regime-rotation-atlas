# Benchmark Ladder for RotationAtlas

To position **RotationAtlas** effectively, we compare it against tools at four levels: those operating in the same specialised niche, those within the broader subfield of quant research platforms, category‑defining incumbents, and cross‑domain gold standards.  Each rung identifies lessons and differentiation strategies.

## Specialised niche: sector‑rotation & leadership detection

Few commercial tools explicitly target cross‑market rotation and leadership migration.  Traditional “sector rotation” analytics exist in blogs and research notes, but mainstream platforms provide only static charts or relative strength ratios.  The absence of packaged rotation intelligence underscores a white‑space opportunity.

### Lessons

1. **Simplicity can mislead** – Simple ratio charts invite over‑interpretation.  A rotation intelligence platform must incorporate breadth, macro context, fragility and uncertainty rather than rely on one indicator.
2. **Drill‑down matters** – Sector‑level moves can mask industry or stock‑level divergence; a competitive system must allow drill‑down into industry groups and leaders/laggards.

## Same subfield: quant research platforms

Platforms such as **Qlib** and **QuantConnect** empower researchers to build and back‑test strategies.  Qlib offers an AI‑oriented quant platform covering supervised learning, market‑dynamics modelling and reinforcement learning with a full pipeline from data processing through back‑testing and execution【773106760199549†L416-L434】.  QuantConnect provides cloud research terminals with terabytes of data, fast back‑testing, parameter optimisation and live trading【619222137946632†L112-L166】.

### Lessons

1. **Infrastructure depth** – These platforms show that end‑to‑end workflows (data→model→back‑test→deploy) are table stakes.  RotationAtlas must deliver a single pipeline powering CLI, API and dashboard instead of separate demos.
2. **Data diversity & scale** – Access to broad data sets and efficient back‑testing is critical.  Even if RotationAtlas starts with fixtures, the design must accommodate plug‑in data sources and scalability.
3. **Model flexibility** – Qlib demonstrates support for different modelling paradigms.  RotationAtlas should remain agnostic to specific models while capturing regime states via rule‑based and statistical methods, and enabling Python sidecar for heavy computations.

## Category‑defining tools: research terminals & intelligence platforms

Institutional terminals such as **Bloomberg**, **FactSet**, **LSEG Workspace** and **Morningstar** dominate the market for real‑time data, analytics and portfolio tools.  These platforms provide comprehensive cross‑asset data and analytics but leave narrative synthesis to the user.  For example, Bloomberg aggregates news, chat and cross‑asset pricing【126663115692038†L368-L378】; FactSet offers granular historical financials and performance attribution【126663115692038†L399-L411】; LSEG combines global news with extensive time‑series data【126663115692038†L419-L445】; Morningstar supplies proprietary risk ratings and moat analysis【126663115692038†L466-L475】.

### Lessons

1. **User expectations** – Professional users are accustomed to reliable data delivery, robust analytics and customisable interfaces.  RotationAtlas must maintain high reliability and configurable dashboards.
2. **Trust & transparency** – Platforms like Hebbia emphasise sentence‑level citations and iterative source decomposition【126663115692038†L292-L309】.  RotationAtlas should generate per‑item evidence ledgers with timestamps, data sources and confidence levels to earn user trust.
3. **Integrations** – OpenBB demonstrates the importance of integrating proprietary and public data securely and allowing users to bring their own agents【477385175529777†L81-L118】.  RotationAtlas should expose provider interfaces and environment‑variable configuration for data plug‑ins.

## Cross‑domain gold standards: agentic systems & multi‑agent orchestration

Recent agentic frameworks such as **TiMi** and **Captide** showcase how large language models can orchestrate complex workflows.  TiMi decouples analysis from deployment and leverages multi‑tier agents for macro and micro strategy development【818644459680853†L44-L52】【818644459680853†L107-L116】.  Captide employs parallel agent processing and structured output generation for financial document analysis, with observability and feedback loops built in【89332042846569†L56-L63】【89332042846569†L117-L122】【89332042846569†L139-L159】.

### Lessons

1. **Orchestration patterns** – Decoupling heavy reasoning from time‑sensitive execution improves efficiency.  RotationAtlas should implement a multi‑agent workflow where breadth, relative strength and macro context agents operate in parallel and a synthesis agent combines their outputs.
2. **Observability & feedback** – Captide’s use of traces and user feedback loops ensures continuous improvement.  RotationAtlas should produce structured reports and change feeds that can be inspected and validated.
3. **Structured outputs** – Using strict schemas for outputs allows downstream automation.  RotationAtlas should generate JSON evidence ledgers with confidence levels and missing‑data reasons.

## Positioning for RotationAtlas

RotationAtlas aims to be **the first cross‑market rotation intelligence platform** that continuously ingests sector ETFs, industry groups, macro proxies and style factors to label regimes, identify leadership cohorts and narrate what changed across multiple horizons.  It competes indirectly with research terminals and quant platforms but focuses on a unique job‑to‑be‑done: explaining **who is taking over from whom** and whether the move is broad, narrow, fragile or accelerating.  By combining multi‑agent workflows, Python sidecar computations and a manager‑friendly UI, RotationAtlas occupies an unserved niche between data terminals and execution platforms.