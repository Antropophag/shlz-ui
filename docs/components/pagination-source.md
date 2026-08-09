# Pagination source contract

`Pagination Btn` (`46:999`) is the authoritative primitive Component Set: 20
exported 40×40 variants over Type and State. Types are Prev, Next, Number,
Ellipsis Prev and Ellipsis Next; states are Default, Hover, Pressed and Disabled,
with only the combinations actually present in extraction treated as source.
`Pagination` (`49:1377`) is a separate 320×40 standalone composition.

Production uses links for navigable pages and non-link elements for disabled or
ellipsis items. Arrow visuals come from normalized `@shlz/icons`; Unicode arrow
glyphs are not part of the component model.
