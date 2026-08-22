## Context

See `proposal.md` for motivation and the two harness specs for normative behavior. Today `AGENTS.md` routes directly from impact to workflow/skills, `tasks.md` is the only OpenSpec progress model, `npm run check` is the only aggregate safety command, and component evidence/reporting is mostly manually assembled. Wave 7 is an executable retrospective: one OpenSpec change covers two families, one shared lifecycle seam, nested integrations, a consumer, 31 completed microtasks, broad Playwright, and mutable report evidence.

Official Codex documentation establishes stable thread start/resume/fork primitives, per-thread token-usage notifications, manual compaction, goals with usage accounting, and configurable bounded subagent concurrency. It also recommends the Codex SDK rather than App Server for automated jobs. The local harness must remain useful when invoked from the App, CLI, another agent, or CI and when those runtime events are not exposed to repository code.

## Goals / Non-Goals

**Goals:**

- Put a deep deterministic module behind one small CLI interface for assess/plan/context/validate/record/summarize/evidence operations.
- Keep always-loaded instructions short while making phase-specific context mechanically discoverable.
- Make packet state reviewable in Git and session telemetry append-only/low-overhead.
- Preserve OpenSpec and the component gate without copying their detail into execution state.

**Non-Goals:**

- Autonomous task assignment, a background daemon, hosted coordination, model selection, prompt management, or an issue tracker.
- Parsing private Codex rollout files or claiming access to usage that the caller did not provide.
- Replacing package scripts, OpenSpec CLI, Playwright, GitHub checks, or audit manifests.

## Decisions

### 1. Use `docs/exec-plans/` for operational state behind one CLI seam

Tracked execution plans belong under `docs/exec-plans/active/<change>/`: `assessment.json`, generated `plan.json`, atomic claim/progress `state.json`, compact `handoff.json`, `validation-ledger.json`, `review-state.json`, and telemetry JSONL. Configuration/schema documentation lives at `docs/exec-plans/`. This is distinct from normative OpenSpec and historical component evidence, visible in PR review, and accessible to fresh sessions without hidden local state.

The external interface is `node tools/harness.mjs <command>` plus thin package-script aliases. Internally it may use focused modules, but callers learn one command family and one plan contract. Alternative locations were `openspec/changes/` (rejected because operational session state is not normative acceptance) and a hidden `.codex/` directory (rejected because state must be repo-native and tool-agnostic).

### 2. Classify from ordinal signals, then group declared semantic work units

Assessments record bounded ordinal/count signals; configurable weighted bands map them to S/M/L/XL. This is a transparent routing heuristic, not token prediction. Work units carry a semantic group and dependencies; the deterministic planner turns groups into packets, preserves declared dependency edges, and validates acyclicity and required fields. S may use one packet; L/XL require multiple packets.

The planner does not infer architecture from filenames or use an LLM inside the deterministic tool. The agent performs semantic discovery once and supplies the assessment/work units; the tool makes that decision durable, repeatable, and testable. Automatic semantic clustering was rejected because brittle similarity heuristics would make packets look objective while hiding judgment.

### 3. Context is an index, not a generated repository summary

Each packet lists exact paths or constrained globs for normative contracts, implementation, tests, evidence, and current findings. `context` resolves and categorizes them, includes dependency handoffs, reports missing/stale entries, and emits paths plus compact metadata by default. It never dumps file bodies or all OpenSpec artifacts. Agents then read only the returned paths needed for the current phase.

Alternative LLM-written summaries were rejected as stale duplicated knowledge. Deterministic indexing provides progressive disclosure while OpenSpec, Git, and tests retain source truth.

### 4. Validation selection is data-driven and repeat-safe

Config maps path patterns to named validation targets and dependency expansions. Selection unions affected targets and orders them by ladder level. A validation ledger stores target, relevant-file fingerprint, outcome, command, packet/session, and reason. Re-running configured expensive targets after a successful identical fingerprint requires `--reason`; cheaper focused checks remain frictionless.

The full suite remains the final integration backstop and CI stays authoritative. Component completion requirements remain additive: the selector can recommend commands, but it cannot mark a component verified or collapse Modal/Drawer status.

### 5. Telemetry accepts observations; it does not spy on runtime state

The CLI appends compact typed events and summarizes actual counts. File-read wrappers and validation runner events are measured directly. Token/context values are accepted only with an explicit source such as `app-server:thread/tokenUsage/updated`; otherwise summaries return `unavailable`. Output byte counts are proxies and labeled accordingly. Telemetry files are intended to be periodically summarized/archived, not loaded into normal packet context.

Parsing CLI UI output, estimating tokens from characters, and reading Codex internal rollout storage were rejected as unstable or misleading.

### 6. V1 is operator-driven multi-session orchestration

The supported flow is: discover/assess → generate plan → claim a ready packet in a fresh or continued session → resolve context → implement/focused validate → write handoff → repeat → integrate/evaluate/final validate. `ready` and dependency state are deterministic. Isolated subagents are appropriate for bounded independent work and Standards/Spec review; shared-workspace parallel writes require explicitly disjoint surfaces.

Although App Server can safely start/resume threads and expose usage, a repository-owned automatic launcher would introduce authentication, client lifecycle, approvals, model/config selection, event persistence, cancellation, and version compatibility. Official guidance points automated jobs to the SDK. V1 therefore documents an adapter seam and capability gap rather than shipping an under-specified daemon. A future thin SDK adapter can consume the same plan/handoff/events interface after operational demand is measured.

### 7. Reviews and evidence use immutable inputs and current queries

Review state stores fixed base ref, known findings, remediation status, and review pass count. A re-review packet points at the fixed base/current remediation diff and unresolved findings. Evidence collection queries Git and validation ledgers at report time; prose records decisions/limitations only. Final SHA is reported dynamically by the PR/CI/operator, eliminating self-referential commit churn.

## Risks / Trade-offs

- **[Assessment inputs are gamed or inconsistent]** → Validate ranges, expose score contributions, keep classification override explicit with rationale, and calibrate from telemetry.
- **[Operational files become noisy]** → Keep schemas compact, ignore ephemeral command output, summarize JSONL, and remove/archive active plans after the change lifecycle.
- **[Pattern mapping misses an affected test]** → Conservative shared-seam expansions, explicit final integration checks, tests for routing fixtures, and an override/reason path.
- **[Packet boundaries cause merge conflicts]** → Encode dependencies and implementation surfaces; parallel mode is advisory and only valid for disjoint surfaces.
- **[Policy adds context overhead]** → Keep `AGENTS.md` as pointers, default CLI output terse, and measure repeated reads/output bytes.
- **[Token signals vary by Codex surface/version]** → Treat runtime usage as an optional adapter and preserve proxy labels/version metadata.

## Migration Plan

1. Add the plan/config contracts, deterministic CLI, fixtures, and unit tests without changing existing component implementation.
2. Add focused/affected package commands and make harness contract tests part of the existing Node suite/CI.
3. Update routing and agent docs with short phase pointers; leave generated OpenSpec skills unchanged.
4. Run Wave 7 retrospective and current-change dogfood plans, then calibrate only from recorded evidence.
5. Rollback by reverting harness files/scripts/docs; existing OpenSpec, component checks, and aggregate commands remain valid throughout.

## Open Questions

- Whether enough real runs justify a future Codex SDK session adapter; v1 telemetry will provide the decision input.
- Exact sizing weights and context proxy thresholds after several S/M/L/XL tasks; defaults are hypotheses in configuration, not permanent policy.
