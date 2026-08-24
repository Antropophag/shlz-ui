## Context

See `proposal.md` for motivation. The current harness already has useful narrow interfaces—`contextIndex`, worker briefs, durable handoffs, review context, validation ledgers, and telemetry—but the operator contract still leaves the agent to reload broad files and retain raw command output across phases. PR #36 provides a representative small OpenSpec/documentation episode: 437 added lines over 16 files plus one bounded review fix, with a user-observed ~188K active/session context and no trusted raw usage trace.

The causal analysis separates six contributors: discovery, always/repeated procedural context, validation output, review output, repeated reads, and orchestration/state transitions. Runtime tokens remain unavailable for forensic reconstruction; repository byte/read proxies are the reproducible measurement seam.

## Goals / Non-Goals

**Goals:**

- Make one deterministic replay go red on current broad/repeated loading and green only after a material reduction.
- Give each semantic phase one deep harness interface: a compact capsule whose digests and obligations preserve correctness and reproducibility.
- Quantify reduction with transparent byte/read/output metrics while keeping runtime observations separate.
- Preserve existing harness commands and plans.

**Non-Goals:**

- Predicting tokens from bytes or claiming the replay recreates the exact 188K runtime path.
- Changing model behavior, Codex runtime internals, OpenSpec, validation depth, or independent review requirements.
- Adding semantic retrieval, embeddings, a broker, a database, a daemon, or network infrastructure.

## Investigation and Candidate Designs

No corrective architecture is selected before the probes. The replay first varies one contributor at a time while holding obligations constant, then compares combined candidates against the same threshold.

### Candidate A: procedural content pruning

Remove duplicated long-form instructions and redundant procedural content inside the authoritative documents. This has the lowest implementation cost. The probe must show whether content duplication inside those documents explains enough of the baseline; cross-phase pointer/attestation behavior belongs to Candidate B.

### Candidate B: phase-bound structured input

Give each phase a compact structured input and on-demand authoritative pointers, potentially using content identity to avoid unchanged repeated reads. A capsule and digest-dedup are possible implementations, not requirements. The probe must show that repeated reads/output carryover are material and that Candidate A cannot meet the target.

### Candidate C: orchestration simplification

Reduce unnecessary phase/state transitions for small fully determined OpenSpec work while preserving gates. The probe must distinguish actual context saved from merely fewer CLI calls and must prove no gate disappears.

### Candidate D: semantic retrieval or broker

Retrieve relevant excerpts using embeddings or a broker. This is the highest-complexity option and is admissible only if deterministic local candidates fail. Current evidence does not justify it.

## Selection Method

The replay declares contributor classes and invariant obligations. Probes remove or bound one contributor at a time and report transparent metrics without converting bytes to tokens. The selected design must meet the configured material-reduction threshold, preserve all obligations and transitions, and win the complexity tie-breaker. Only after this result will this design record the chosen mechanism and its exact interface.

## Evidence-backed Decision

The corrected PR #36 replay uses immutable Git blobs from base `50bee6f` and head `b7dd0ae` plus checked-in captured external evidence. Its independent oracle is separate from the candidate phase manifest. The baseline measured 29 phase reads, 12 authoritative source identities, and 153,997 repository-controlled bytes. The selected candidate measured 57,234 newly read bytes plus 8,595 capsule bytes (65,829 total), a reduction of 88,168 bytes or 57.25%. Repeated-read bytes fell from 96,763 to zero; procedural bytes fell from 112,971 to 33,195. Discovery, validation, review, and state inputs were preserved rather than credited with artificial savings. These are byte proxies, not token estimates; the 188K value remains user-observed only.

Select Candidate B: a packet-integrated phase capsule with content digests, `readNow` for new/changed required sources, `attested` identities for content acknowledged earlier in the same physical session, obligations, transition, verdicts, unresolved findings, and raw-evidence pointers. `context-capsule` derives this input from the real packet context index and a persisted session ledger; `context-ack` records the exact capsule/source digests after the operator has read the inputs. Fresh workers start fresh ledgers. The replay compares the candidate with a separately stored pinned oracle and refuses an improvement verdict unless source, obligation, transition, finding, and raw-evidence equivalence pass.

Candidate A is insufficient alone because literal document duplication was not the measured multiplier. Candidate C targets a smaller state representation and risks removing correctness transitions. Candidate D is unnecessary because Candidate B's source-read reduction alone exceeds the 35% threshold before counting safe output compaction.

The executable candidate table makes this comparison explicit. Candidate A preserves equivalence but measures 0% evidenced reduction because the procedural corpus contains no duplicated long-form lines. Candidate B passes equivalence at 57.25%. Candidate C models removing all 253 transition bytes, reaches only 0.16%, and fails equivalence because required transitions disappear. Candidate D is not probed further because the lower-complexity deterministic candidate already passes both gates.

### Keep the 188K signal observational

The fixture records `{ value: 188000, unit: "tokens", provenance: "user-observed" }` and explicitly states that trusted runtime telemetry is unavailable. The replay never converts bytes to tokens. This preserves the forensic signal without manufacturing precision.

### Stable replay input

The candidate fixture and independent oracle separately record immutable PR metadata, contributor classifications, source identities, and obligations derived from actual PR artifacts. Git-backed inputs use full commit hashes; external PR/review evidence is captured in a checked-in oracle. Probe metrics must be sourced or explicitly labeled modeled. This makes replay offline and stable. The report documents that it is representative, not a transcript.

### Runtime limitation

The fresh implementation worker reported 1,169,262 input tokens, including 1,048,576 cached input tokens. This observation is not comparable to the byte proxy and shows that fresh-process isolation alone does not control total runtime input. Therefore the selected mechanism claims only a measured reduction in repository-controlled phase input. It does not claim a 57.25% reduction in total tokens or active/session context; runtime-level improvement needs comparable before/after telemetry outside this change.

## Risks / Trade-offs

- [A compact representation may prove identity but not comprehension] → every candidate must preserve explicit obligations and addressable authoritative inputs; the replay claims input reduction, not semantic understanding.
- [A fixture can overfit PR #36] → model all six requested contributor classes and keep the replay schema reusable; PR #36 is the acceptance fixture, not hard-coded logic.
- [Byte reduction may differ from token reduction] → report bytes as proxies and runtime values only from trusted telemetry.
- [A selected wrapper can become another procedural document] → count its own cost and keep authority outside generated representations.
- [Output summaries can hide a failure] → equivalence requires obligation IDs, verdict/status, unresolved findings, and state transitions; raw evidence remains addressable on demand.

## Migration Plan

Additive CLI behavior and fixtures require no migration. Existing plans, worker briefs, telemetry, and review state remain valid. Revert by removing the new command/module/fixtures/docs; no persisted external state is created.
