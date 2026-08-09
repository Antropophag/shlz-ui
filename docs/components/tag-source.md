# Tag source contract

Tag and Person tag are distinct Component Sets. Tag (`785:48349`) has two
111×30 Type variants: Filled and Stroke. Person tag (`371:32592`) has Default
193×30 and Closable 213×30 variants and owns avatar/removal composition. All
four variants exported without warnings.

Production exposes `.shlz-person-tag` for the structural family instead of
pretending avatar/removal are generic Tag axes. Visual assets use normalized
icons; consumer-provided real avatar images may replace the neutral user icon.
