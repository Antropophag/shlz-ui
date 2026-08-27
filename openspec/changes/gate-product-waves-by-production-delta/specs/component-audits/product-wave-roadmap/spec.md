## Purpose

Separates the durable audit scope map from product delivery progress so numbered evidence work cannot masquerade as a shipped product outcome.

## ADDED Requirements

### Requirement: Audit dispositions do not advance the product roadmap

The roadmap SHALL treat source discovery, absence proof, audit manifests, inventory reconciliation, reports, and audit verification as bounded evidence outcomes. Such outcomes MAY update audit evidence but MUST NOT mark a product wave delivered, exhaust a product-roadmap entry, or authorize the next numbered product wave.

#### Scenario: Audit-only wave is merged

- **WHEN** a numbered audit disposition is delivered without an expected production delta
- **THEN** the audit evidence remains recorded while product-roadmap progress and the next product wave remain unchanged

### Requirement: Product-wave progress is production-delta bound

A numbered entry SHALL count as product-wave progress only when its pre-execution route receipt records a non-empty expected production delta and product-roadmap eligibility, and delivery carries production-outcome proof derived from a passing validation of the current candidate and explicit outcome-evidence closure. Repeating the expected production delta in a validation request MUST NOT constitute proof. Number order MUST NOT itself authorize starting the next wave.

#### Scenario: Matching production delta is delivered

- **WHEN** an eligible numbered product wave delivers the production delta declared before heavy execution
- **THEN** only that matching product-roadmap entry may advance after candidate/runtime-bound production-outcome proof passes

#### Scenario: Current work finishes without next-wave authorization

- **WHEN** the current bounded or product episode completes and no separate request authorizes the next wave
- **THEN** the agent stops without selecting or starting the next numbered wave
