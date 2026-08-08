# Source of truth

Evidence authority is fixed:

1. `shlz-design-source/raw/svg/` — original Figma exports and primary source of truth.
2. Other `shlz-design-source/` data — derived indexes used to locate evidence.
3. Repository tokens and contracts — reviewed design-system decisions.
4. Consumer applications — validation cases, never visual authorities.

The entire source directory is read-only. Generated implementation belongs in `packages/`, `apps/`, `tools/`, and `docs/`.

Every material claim uses one of: **FACT** (direct raw SVG observation), **DERIVED** (pattern across observations), **DECISION** (repository contract), or **UNKNOWN** (not recoverable). A derived frequency is not proof of a Figma variable.

The baseline source checksums are versioned in the source inventory. CI validation never rewrites or “fixes” source SVGs.
