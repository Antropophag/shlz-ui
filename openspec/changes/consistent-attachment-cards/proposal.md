## Why

Composer attachments lack the file-type visual; File Upload uses a platform-dependent paper emoji. Both stretch file rows across their containers, unlike the compact Comment Feed attachments the user identified as correct.

## What Changes

- Apply the established compact file-card composition to Composer and File Upload fixtures and live consumers, including dynamically selected files.
- Use existing source-derived file-type SVGs, consistent filename/metadata hierarchy, and wrapping cards that fit narrow containers.
- Preserve filenames, metadata meaning, selection/removal ownership, disabled/read-only/error behavior, and existing APIs.

## Capabilities

### New Capabilities

- `data-display/attachment-composition`: Consistent compact attachments in Composer and File Upload, grounded in Documents.svg and Комментарии.svg.

### Modified Capabilities

None.

## Impact

Scoped styles in Composer/File Upload, showcase file-card markup and consumer rendering, focused browser evidence, documentation and affected audit manifests. No framework dependency or file-upload service is introduced. Comment Feed is the comparison surface; its current presentation is preserved. Generic File Row consumers, source assets, editor behavior, upload validation and backend operations are outside scope. Risks include clipped actions, long filenames, metadata contrast, and empty placeholders incorrectly appearing as real files.
