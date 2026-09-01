### Requirement: Persisted audit report

The documentation change SHALL preserve the completed audit as a readable, dated Markdown report tied to its audited commit.

#### Scenario: Report is repository-formatted

- **WHEN** the persisted audit report is checked with the repository formatter
- **THEN** the formatter completes successfully without modifying the report
