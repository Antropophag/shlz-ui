# Tabs source contract

The Basic Elements extraction contains three separate Component Sets and one
standalone composition. `tab` (`52:3213`) has four State variants at
116–117×61. `Tab` (`58:5374`) has four State variants at 68×40 with a 20px
pill radius. `Tab` (`185:15928`) has six observed Select/State combinations at
74–75×39 with 10px top corners. `Tab group` (`52:3256`) is a 581×61 standalone
composition. All 14 variants exported without warnings.

The production modifiers `--pill` and `--boxed` preserve those visual families.
Automatic ARIA tab activation is a browser-layer DECISION. Source exposes no
icon axis, and missing Select/State combinations in the six-node boxed set are
not synthesized as source variants.
