# Notification source contract

Notification (`89:17043`) has three 384×58 Type variants: Default, Error and
With button. Snackbar (`424:37565`) has six 384×58 countdown variants Number
5 through 0. All use the established 29px pill surface and export without
warnings.

Production preserves the existing close geometry and action button. Check and
close visuals use normalized icons. Source proves countdown frames, but not
runtime duration, dismissal timing or live-region policy; those remain UNKNOWN.

Across Snackbar Number=5/4/3/2/1/0, the displayed number and the white 3px
circular progress contour change. The contour decreases from a complete ring
at 5 to a short source-defined remnant at the top at 0. The 384×58 dark pill,
message and action geometry remain unchanged. The fidelity fixture preserves
the six exported contour paths directly; it does not infer duration, a
one-second step, easing, auto-dismiss, pause-on-hover, reset or callbacks.
