## Context

See `proposal.md` for motivation and the delta spec for acceptance behavior. The inventory records one source-only parent family with three authoritative SVGs, no production implementation, and gaps at every evidence level except indexed source presence. The central risk is collapsing three application domains into one generic component or treating rich static artwork as proof of runtime behavior.

## Goals / Non-Goals

**Goals:**

- Establish source and absence ledgers attributable independently to Messaging, History, and Planner.
- Build a reproducible census that distinguishes higher-level composition signatures, nested verified primitives, audit evidence, and unrelated terminology.
- Make future implementations force explicit reclassification without introducing a generic runtime abstraction now.
- Reconcile the final roadmap family while preserving three separate dispositions.

**Non-Goals:**

- No messaging service, editor, planner engine, persistence layer, domain model, attachment controller, package export, or application screen.
- No inferred interaction, responsive, accessibility, synchronization, delivery, chronology, recurrence, timezone, or live-region contract.
- No re-certification of nested primitives and no design-source mutation.

## Decisions

### 1. Use one parent manifest with three mandatory sub-scope ledgers

One `messaging-history-planner-compositions.json` matches the roadmap inventory family, while mandatory Messaging, History, and Planner records preserve independent authority, occurrence, evidence, limitations, findings, and disposition. Three disconnected family manifests were rejected because the inventory and roadmap define one family; one undifferentiated ledger was rejected because it could allow evidence leakage between domains.

### 2. Treat the SVGs as separate visual authorities, not a shared domain contract

Each named SVG governs only its own observed composition geometry, paint, and visible content. Similar employees, events, messages, editor controls, or attachments are cross-source observations until an approved shared contract exists. Deriving a reusable conversation, history, or scheduling model was rejected because static Figma exports do not establish data or behavior ownership.

### 3. Make census evidence bounded, categorized, and mutation-sensitive

A focused Node census will scan relevant application, package, export, fixture, documentation, style, script, Vue, PHP, and HTML surfaces. It will classify source/audit paths, nested primitive dependencies, and unrelated terminology separately, and synthetic unclassified Messaging, History, and Planner surfaces must each fail. An unconstrained keyword count was rejected because terms such as message, history, event, employee, plan, and attachment are common in tooling and prose.

### 4. Add runtime or visual evidence only for a real higher-level composition

If the census confirms source-only absence, structural source/ledger evidence is applicable while runtime browser behavior, accessibility, focused implementation visuals, consumer integration, and responsive/content stress are not applicable with sub-scope-specific reasons. Rendering raw SVGs in the Showcase was rejected because it would prove only source display, not a design-system composition.

### 5. Close the roadmap audit without claiming product delivery

A bounded `VERIFIED` result states that source boundaries and repository absence are currently proven for all three sub-scopes. It does not claim that messaging, history, or planner functionality exists and does not authorize a product implementation.

## Risks / Trade-offs

- **A future implementation evades narrow signatures** → Scan multiple structural forms and prove synthetic mutations for all three sub-scopes.
- **Generic terminology creates false positives** → Classify paths and structural signatures instead of weakening the closed boundary.
- **Outlined text limits literal labels** → Prefer inspectable frame/group geometry and treat semantic label interpretation explicitly.
- **Evidence leaks across sub-scopes or nested primitives** → Enforce independent ledgers and test each missing-disposition failure path.

## Migration Plan

This is an additive audit with no runtime migration. Rollback removes Wave 12 audit artifacts and tests and restores the inventory row; authoritative sources and package/application behavior remain unchanged.
