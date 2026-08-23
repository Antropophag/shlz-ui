## Context

The existing docs name impact routing and execution sizing as separate stages, but the executable preflight admits only a branch whose merge base and HEAD equal current `origin/main`; conformance and review are then described against that same fixed base. There is no legal bounded episode on an existing PR branch. In PR #30, two findings touched two test files, but the available workflow pulled the 32-file material parent change and its OpenSpec/audit context back into scope. Existing telemetry cannot explain the reported 255K tokens because it recorded no usage events for that run; Git history and review data do establish the parent/follow-up surface mismatch.

## Goals / Non-Goals

**Goals:**

- Make the delta under execution the stable unit for semantic assessment, sizing, validation, and review.
- Keep four orthogonal outputs explicit: semantic route, specification need, execution size, and orchestration.
- Put baseline verification behind one small harness interface shared by new work and existing-PR follow-ups.
- Keep conservative escalation and every existing delivery/ownership guarantee.

**Non-Goals:**

- Add a remediation mode, FAST lane, CodeRabbit-specific rule, token budget, or magic diff threshold.
- Infer semantics from line count, filenames, review author, or parent PR labels.
- Automate agent launching, merge pull requests, weaken component completion gates, or replace OpenSpec.

## Decisions

### 1. Route an execution episode, not its ancestry

An episode is the requested delta plus an immutable Git baseline. Semantic assessment applies to the episode intent; deterministic conformance inspects the episode diff. Parent PR context is read only when needed to verify the finding or understand a touched contract.

This is simpler than a remediation/FAST lane because there is no new behavioral path: the same direct/OpenSpec decision and same risk floor apply. The only new seam is baseline provenance. Treating the entire PR as the unit was rejected because ancestry is evidence, not current scope. Using raw diff size as the unit was rejected because a tiny permission or public-contract change remains material.

### 2. Four orthogonal decisions, evaluated in order

1. **Semantic impact**: direct-eligible or material/unknown.
2. **Specification need**: none for direct; requirements/OpenSpec for material/unknown.
3. **Execution size**: existing S/M/L/XL observable-work classifier.
4. **Orchestration**: inline for S by default; adaptive plan for M/L/XL or uncertain context growth; independent review based on semantic materiality or execution/review risk.

This preserves the existing deep semantic guard and sizing classifier but removes the implication that OpenSpec always entails packet machinery or that direct always means small. A single composite risk score was rejected because high semantic risk and high execution complexity require different safeguards and cannot safely cancel each other out.

### 3. Persist a verified execution-baseline record

Extend `implementation-preflight` with an optional existing open PR input and an output record under the active execution directory. For new work, the verified baseline is current `origin/main`. For a follow-up, Git/GitHub evidence must prove clean task branch, configured upstream, identical local/upstream/open-PR head, open state, and default target. The record contains baseline commit, kind, branch, and optional PR URL; it contains no requirements or acceptance content.

`route-conformance` consumes this record and derives the diff from its commit. Documentation points affected validation and review at the same commit. The record is a deep module interface: callers no longer reconstruct what “fixed base” means.

Allowing arbitrary `--base HEAD` was rejected because it can silently bless an unpushed or unrelated branch. Requiring a new branch/PR for every review fix was rejected because it fragments delivery and still reloads parent context.

### 4. A minimum-ceremony table replaces lane names

Direct S work uses inline execution, focused validation, conformance, and target-diff inspection. Material S work still synthesizes OpenSpec and receives independent Standards/Spec review, but does not need an adaptive packet plan. M/L/XL or uncertain growth uses the existing plan/packet interfaces on either semantic route. This is a conjunction of independent decisions, not a named mode.

### 5. Evaluation fixtures expose classification and context selection

One machine-readable matrix records representative inputs and expected outputs. PR #30 cases record observed parent surface (32 files), follow-up surface (2 files), reported usage (~255K tokens/45% context), and expected post-change context roots. Assertions validate decisions and selected surfaces, not token targets. This guards quality against metric gaming and avoids pretending unavailable telemetry is measured.

## Risks / Trade-offs

- **[An agent understates the episode to hide a coupled change]** → Route conformance compares the complete baseline diff and deterministic risk floor; discovery raises the route.
- **[An existing PR moved after preflight]** → The immutable commit remains the episode baseline; delivery requires local/upstream/PR head agreement at completion.
- **[OpenSpec S work becomes under-reviewed]** → Semantic materiality independently requires two-axis review even when packet planning is skipped.
- **[Direct S review misses a defect]** → Focused tests, conformance, complete target-diff inspection, CI, and external PR review remain; risk signals can explicitly raise review/orchestration without changing semantic route.
- **[Historical token observation is unverifiable]** → Label it user-reported and do not use it as a pass/fail target.

## Migration Plan

Add failing evaluation/preflight regressions, implement the baseline record and scoped conformance interface, update the routing/execution/validation pointers, and run focused harness/OpenSpec checks plus diff-scoped review. Existing default `origin/main` command usage remains compatible; existing plan and requirements schemas remain readable. Deliver on a new task branch through an unmerged PR.
