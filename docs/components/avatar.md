# Avatar

The public contract is `.shlz-avatar` with size modifiers `--24`, `--32`, `--40`, `--64`, and optional image/icon children. All 12 source variants are circle × four sizes × image/text/icon. Badge, arbitrary shape and 48px are intentionally absent.

Broken image behavior is `CONSUMER_DEFINED`: consumers should replace a failed image with text or icon markup. The CSS does not hide a broken image in a way that could leave an unnamed empty avatar.
