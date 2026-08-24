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

The corrected PR #36 replay uses immutable Git blobs from base `50bee6f` and head `b7dd0ae` plus checked-in captured external evidence. Its frozen oracle is separate from the candidate phase manifest. The replay observes 29 modeled phase source reads, 12 authoritative source identities, and 153,997 source-read bytes; 96,763 of those bytes are repeated source content. An attestation capsule can replace those later full inputs with digest references, but this proves only that the harness does not resend or require rereading the unchanged repository source through that interface. It does not prove that the model avoided processing, that cached input or prior attention was evicted, or that active/session retention fell. Validation/CI/review raw output and retention were not present in the modeled source-read denominator and receive no reduction credit. The 188K active/session value remains an unsplit user observation, so comparable total improvement is unavailable.

Select Candidate B: a packet-integrated phase capsule with content digests, `readNow` for new/changed required sources, `attested` identities for content acknowledged earlier in the same physical session, obligations, transition, verdicts, unresolved findings, and raw-evidence pointers. Guarded `worker-run` creates the initial capsule and fresh ledger automatically and supplies the capsule in the worker brief; explicit `context-capsule`/`context-ack` commands remain available for later phase transitions. This removes reliance on an operator remembering to start phase control. The replay compares the candidate with a separately stored pinned oracle and refuses an improvement verdict unless source, obligation, transition, finding, and raw-evidence equivalence pass.

Validation and CI use a compact/raw boundary: structured results retain command, outcome, obligations, and a content-addressed raw-log pointer. Raw logs remain on disk and are never claimed eliminated; later phase input carries the compact record unless a finding requires raw inspection. Digest or byte-size drift fails closed. This boundary reduces repeated inline output only where the harness owns the phase input, while retention and the original command's output cost remain present.

Candidate A is insufficient alone because literal document duplication was not the measured multiplier. Candidate C targets a smaller state representation and risks removing correctness transitions. Candidate D remains unnecessary because Candidate B meets the 35% threshold for the narrowly named repeated-source-input proxy; it does not establish a total active/session reduction.

The executable candidate table makes this comparison explicit. Candidate A preserves equivalence but measures 0% evidenced reduction because the procedural corpus contains no duplicated long-form lines. Candidate B passes equivalence at 57.25%. Candidate C models removing all 253 transition bytes, reaches only 0.16%, and fails equivalence because required transitions disappear. Candidate D is not probed further because the lower-complexity deterministic candidate already passes both gates.

### Keep the 188K signal observational

The fixture records `{ value: 188000, unit: "tokens", provenance: "user-observed" }` and explicitly states that trusted runtime telemetry is unavailable. The replay never converts bytes to tokens. This preserves the forensic signal without manufacturing precision.

### Stable replay input

The candidate fixture and independent oracle separately record immutable PR metadata, contributor classifications, source identities, and obligations derived from actual PR artifacts. The oracle is a frozen contract assembled from the captured PR/review evidence rather than generated from the candidate manifest. Git-backed inputs, including the checked-in external evidence capture, use full commit hashes. Stable collections use plain code-unit ordering instead of locale-sensitive collation. Probe metrics must be sourced or explicitly labeled modeled. This makes replay offline and stable. The report documents that it is representative, not a transcript.

### Review follow-up hardening

Acknowledgement treats every non-empty dependency-handoff `unresolvedFindings` entry as unresolved, including legacy string entries, while retaining status-aware handling for structured review findings. The operator-supplied session identity is explicitly part of the worker-boundary contract: a fresh worker must choose a new identity and ledger. Delivery evidence is committed only after the root orchestration guard has actually bound the worker claim and persisted the durable handoff.

### Runtime limitation

The fresh implementation worker reported 1,169,262 input tokens, including 1,048,576 cached input tokens. This observation is not comparable to the byte proxy and shows that fresh-process isolation alone does not control total runtime input. Therefore the selected mechanism reports 96,763 bytes as unchanged source content not reread through the modeled interface, plus capsule overhead; it does not call those bytes prevented runtime cost. Validation/CI/output generation and raw-log retention remain incurred. Total token and active/session improvement are unavailable until comparable before/after telemetry exists.

## Risks / Trade-offs

- [A compact representation may prove identity but not comprehension] → every candidate must preserve explicit obligations and addressable authoritative inputs; the replay claims input reduction, not semantic understanding.
- [A fixture can overfit PR #36] → model all six requested contributor classes and keep the replay schema reusable; PR #36 is the acceptance fixture, not hard-coded logic.
- [Byte reduction may differ from token reduction] → report bytes as proxies and runtime values only from trusted telemetry.
- [A selected wrapper can become another procedural document] → count its own cost and keep authority outside generated representations.
- [Output summaries can hide a failure] → equivalence requires obligation IDs, verdict/status, unresolved findings, and state transitions; raw evidence remains addressable on demand.

## Migration Plan

Additive CLI behavior and fixtures require no migration. Existing plans, worker briefs, telemetry, and review state remain valid. Revert by removing the new command/module/fixtures/docs; no persisted external state is created.
