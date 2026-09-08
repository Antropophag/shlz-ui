# Browser and screen-reader evidence

The library distinguishes browser automation from actual assistive-technology (AT) evidence. A browser keyboard test or axe result does not establish what a screen reader conveys. Real AT automation can collect speech output, but it is not a human usability study or a general WCAG conformance certificate. [WAI evaluation guidance](https://www.w3.org/WAI/test-evaluate/), [ARIA-AT](https://aria-at.w3.org/about).

## Evidence layers

| Layer                          | Scope                                                                                   | Boundary                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Full browser/visual regression | Playwright-pinned Chromium on Linux                                                     | Existing component tests and snapshots                         |
| Functional smoke               | Seven shared workflows in Chromium, Firefox and WebKit                                  | Browser behavior; no AT or cross-engine visual claim           |
| Actual screen reader           | Windows 10 Pro build 19045, NVDA 2026.2 AMD64, Chrome 152.0.7977.64 and Firefox 155.0.1 | Versioned, agent-operated keyboard and NVDA speech checkpoints |

The Windows baseline is bounded to the recorded versions and settings. NVDA uses English interface/role terminology, eSpeak NG, desktop keyboard layout and Russian fixture content. Mouse tracking and automatic page reading are disabled to isolate keyboard checkpoints. The system screen-reader flag is left unchanged. The complete configuration is [nvda.ini](../tools/at/nvda.ini).

Other Windows versions, other NVDA languages/versions, JAWS, VoiceOver/Safari, Linux/Orca, mobile AT, braille, audio quality and subjective comprehension remain unverified. Playwright WebKit on Linux is not Safari with VoiceOver. A later change does not inherit a new AT pass merely because this record exists.

## Workflow contract

The matrix has seven workflows per browser and 28 named checkpoints per browser. Each checkpoint retains the OS-keyboard actions, observed NVDA speech, input-event count, foreground ownership and semantic/state assertions. Expected names and states come from existing component contracts and fixtures; observed word order is not prescribed universally.

| Workflow    | Checkpoints                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| Input       | Name/value in the live Data Workspace search; consumer-authored invalid state and error description            |
| Checkbox    | Unchecked, checked, mixed and unavailable                                                                      |
| Select      | Collapsed name/role, opening, option navigation, commit, cancellation and unavailable                          |
| Modal       | Named dialog and initial focus, a full Tab cycle without background DOM controls, dismissal and returned focus |
| Popover     | Expanded trigger, native input/action order, dismissal and returned focus                                      |
| Date Picker | Initial date, next-day navigation, commitment/value reading, cancellation                                      |
| File Upload | Named native chooser, selected filename in the consumer list, Showcase and plain-HTML errors, unavailable      |

The Input error is an explicitly prepared consumer validation state on an existing root; it does not claim application business-validation behavior. File selection uses a real Windows file dialog and a task-owned sample file. Selected filenames and announcements remain consumer-owned.

## Reader and browser details

- NVDA can consume the first Escape to leave focus mode. Select cancellation records the actual Escape sequence needed to dismiss the popup and restore focus.
- Calendar arrows are exercised in NVDA focus mode. The committed date is read from the Date Field after checking that commit first returned focus to the trigger.
- A native HTML modal makes background page controls inert; browser chrome remains reachable. The Tab walk accounts for that browser boundary rather than installing a custom trap.
- Firefox's focused, visually hidden native file chooser can report `Browse…` without the selected filename. The supported consumer flow reads the rendered file list with NVDA browse navigation. It does not infer an automatic selection announcement.
- Chrome is an independently launched stock browser connected with Playwright `noDefaults`. Normal Playwright focus emulation would make `document.hasFocus()` unsuitable for verifying real desktop keyboard focus. Firefox uses stock Firefox through Geckodriver with `focusmanager.testmode=false`.

These are recorded execution conditions, not hidden assertion reductions. The [APG date-picker example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) and [combobox example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) are reference material; their results do not certify SHLZ's implementation.

## Reproducing the local run

Prerequisites: WSL with working Windows interop, Windows Node.js, Windows Python 3 launcher, stock Chrome, and isolated copies of NVDA, Firefox and Geckodriver. No global installation, service, browser-profile replacement or manual user interaction is required.

The initial binaries came from the official [NVDA 2026.2 release](https://download.nvaccess.org/releases/2026.2/), [Firefox 155.0.1 release](https://archive.mozilla.org/pub/firefox/releases/155.0.1/win64/en-US/) and [Geckodriver 0.37.1 release](https://github.com/mozilla/geckodriver/releases/tag/v0.37.1). NVDA and Firefox Authenticode signatures were verified as valid. Extract Firefox into a fresh task directory. Create NVDA's portable copy with `--create-portable-silent --portable-path=<fresh-directory>`; do not point that command at an existing installation.

Build and serve the current checkout in WSL:

```sh
npm ci --ignore-scripts
npm run build
SHLZ_SHOWCASE_PORT=4183 node tools/serve-built-showcase.mjs
```

Prepare a local settings JSON with these fields:

```json
{
  "phase": "verification",
  "sourceCommit": "<exact built source commit>",
  "baseURL": "http://127.0.0.1:4183",
  "repoPosix": "/absolute/WSL/path/to/checkout",
  "tempRoot": "C:\\Temp\\shlz-at-<unique-id>",
  "chrome": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "firefox": "C:\\Temp\\shlz-at-<unique-id>\\firefox\\core\\firefox.exe",
  "geckodriver": "C:\\Temp\\shlz-at-<unique-id>\\geckodriver.exe",
  "nvda": "C:\\Temp\\shlz-at-<unique-id>\\nvda\\nvda.exe",
  "sampleFile": "C:\\Temp\\shlz-at-<unique-id>\\shlz-at-upload.txt",
  "output": "C:\\Temp\\shlz-at-<unique-id>\\new-result.json",
  "browsers": ["chrome", "firefox"]
}
```

The sample must contain only synthetic test data. The output must be a new JSON file directly inside the dedicated task directory; existing output files are not overwritten. Use `wslpath -w` to obtain Windows paths to the runner and settings:

```text
<Windows node.exe> <Windows path to tools/at/run-windows.mjs> <Windows path to settings.json>
```

The runner opens only isolated test browser profiles, refuses an existing NVDA session, and sends interaction keys through the Windows helper. It validates foreground ownership, including an explicitly owned native file dialog; it does not type into browser chrome as an editable page. On ownership loss it stops the action. Only the run's processes are closed.

NVDA's documented input/output logging level 12 supplies actual keyboard and speech records. Raw desktop logs stay local. Published evidence contains relevant fixture speech and redacted metadata; native file-dialog directory listings are excluded. [NVDA command-line options](https://download.nvaccess.org/documentation/en/userGuide.html#CommandLineOptions), [NVDA configuration](https://github.com/nvaccess/nvda/blob/release-2026.2/source/config/configSpec.py), [Windows SendInput](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput).

## Validation and the discovered fixture defect

`npm test` checks the evidence contract, guarded input policy and the two discriminating failure cases. Missing speech cannot pass even when DOM checks pass; a foreign foreground cannot receive input. These Linux checks do not claim to run NVDA.

The standalone File Upload error fixture had `aria-invalid` only on its container. NVDA read the description but did not convey the native input's invalid state. The fixture now applies the attribute to the input too, matching the existing public contract. Its six occurrence identities, source artwork, CSS and controller remain unchanged. The focused File Upload suite covers those occurrences, the live Data Workspace consumer, state behavior, narrow/content stress and existing visual baselines.

The generic Impeccable detector fell back to regex because optional parser modules were unavailable; its empty finding list is not an accessibility or visual pass. The focused browser checks and actual NVDA evidence are the relevant verification.
