# Engineering skill routing

OpenSpec impact routing and engineering skill routing answer different questions. First use `docs/openspec.md` to choose the direct or OpenSpec workflow. Then choose the smallest set of skills that materially improves the task:

`task → impact routing → direct/OpenSpec workflow → applicable skills → implementation → validation/review`

Skills supplement the selected workflow; they do not create parallel workflow state or replace OpenSpec artifacts.

## Task routes

### Bugs and regressions

Use `diagnosing-bugs` first for non-trivial bugs. Add `tdd` when the fix is well expressed by a regression test:

`diagnose → reproduce/test → minimal fix → regression validation`

Preserve the existing contract while fixing the implementation. If diagnosis shows that the contract itself must change, reclassify the work through `docs/openspec.md` before implementation.

### Architecture and domain modeling

Use `codebase-design` for package boundaries, public interfaces, component architecture, and substantial architectural or design decisions. Also consider `domain-modeling` when the work changes domain concepts, ownership, terminology, `CONTEXT.md`, or ADRs. Ordinary UI component work does not need `domain-modeling` by default.

### Stress-testing decisions

Use `grilling` to stress-test architectural or ambiguous decisions, expensive or hard-to-reverse changes, and substantial trade-offs. Prefer:

`explore/design/proposal → grilling → revise if needed → implementation`

Reserve it for decisions that benefit from pressure-testing; obvious small changes do not need it.

### UI and visual work

For substantial UI or visual work, consider these project-priority skills by role:

- `impeccable` for UI design, frontend audit, refinement, and UX or visual consistency;
- `gpt-taste` for expressive composition, visual quality, and stronger UI solutions;
- `motion-design` for transitions, animations, micro-interactions, and motion behavior.

Select only the applicable skills. A small CSS correction to an already authoritative value needs no visual skill stack; a new visual component variant should normally consider `impeccable` and `gpt-taste`, adding `motion-design` only when motion is meaningful.

`shlz-design-source/` remains the authoritative design source. When it specifies the exact appearance, visual skills help reproduce that design faithfully rather than reinterpret or improve it. They may propose alternatives only when the task explicitly authorizes experimental or new design.

### Prototypes and research

Use `prototype` for disposable experiments that test a hypothesis. A successful prototype is not automatically a production contract; if adopting it changes a contract, return to the normal OpenSpec impact routing.

Use `research` when a decision depends on external primary sources, standards, browser or platform behavior, accessibility guidance, or facts that repository state cannot establish reliably. Skip it for common, low-risk facts.

### Review

Before declaring a substantial implementation ready or complete, use `code-review` to check it against the task, any OpenSpec artifacts, repository conventions, tests, architecture, and the authoritative design source when applicable. This complements rather than replaces external GitHub review.

### Agent and tooling maintenance

Keep `openai-docs`, `plugin-creator`, `skill-creator`, `skill-installer`, `find-skills`, `plugin-management:plugin-management`, `writing-for-agents`, and `imagegen` outside ordinary development routing. Use them only when the task itself concerns their area; in particular, use `writing-for-agents` for agent-facing instructions such as `AGENTS.md` and harness documentation.

## Routing smoke examples

| Request                                                          | Route                                                                                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fix a documentation typo                                         | Direct workflow; no specialist skill                                                                                                              |
| Remove a Select border that conflicts with `shlz-design-source/` | Direct bug workflow; `diagnosing-bugs`, optionally `tdd`; preserve the authoritative design                                                       |
| Create a new visual Empty State                                  | OpenSpec if it creates a contract; `impeccable` + `gpt-taste`; `motion-design` only for meaningful motion; tests/visual validation; `code-review` |
| Change typography profile architecture                           | Full OpenSpec; `codebase-design`; `grilling`; `domain-modeling` if domain concepts or ownership change; implementation/tests; `code-review`       |
| Decide whether to introduce a responsive behavior model          | OpenSpec explore; `codebase-design`; `grilling`; implement only after choosing a direction                                                        |
| Quickly test a new interaction pattern                           | `prototype`; if adopted as a contract change, route into an OpenSpec change                                                                       |
