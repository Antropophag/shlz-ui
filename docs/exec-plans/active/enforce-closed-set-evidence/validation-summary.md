# Validation summary

- Focused harness: 22/22 passed.
- Aggregate Node tests after dependency/bootstrap build: 126/126 passed.
- ESLint, Stylelint, and repository-wide Prettier check: passed.
- Package and Showcase build: passed; Vite reported only its pre-existing large-chunk advisory.
- OpenSpec 1.10.0 integration check: passed.
- Strict OpenSpec validation: 21/21 changes passed.
- `git diff --check`: passed.
- Symmetric closed-set probe: candidate rejects missing coverage; known-bad adapter accepts it and therefore fails the probe.

The first aggregate test attempt ran before dependencies and generated `dist` outputs existed in the new worktree. It reported 12 bootstrap failures (`ENOENT` and `tsc not found`). After `npm ci`, generation, and package build, the unchanged aggregate suite passed 126/126. `npm ci` reported zero vulnerabilities and one blocked `esbuild` install script; Vite builds still completed successfully.

Browser screenshots were not rerun because the change affects only the Node harness contract and documentation, not UI runtime or visual output.
