# Link

`a.shlz-link` is the generic link. Source defines Default, Hover, Pressed and Disabled at content-sized 32×21 for the word “Link”. Every state uses Golos Text Regular at 16px/130% with -1% letter spacing and no text decoration. Disabled links are rendered without `href`, preferably as `span.shlz-link[aria-disabled=true]`; visited, icon and external-link variants are not part of the contract.

The focus-visible outline is an accessibility engineering decision.
