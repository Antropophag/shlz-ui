import { expect, test } from "@playwright/test";
import { readComponentAuditManifest } from "./component-audit.js";

const manifests = Object.fromEntries(
  await Promise.all(
    [
      "input",
      "textarea",
      "select",
      "checkbox",
      "radio",
      "switch",
      "button",
      "link",
      "segment",
      "tabs",
      "pagination",
    ].map(async (component) => [
      component,
      await readComponentAuditManifest(
        new globalThis.URL(
          `../../docs/component-audits/${component}.json`,
          import.meta.url,
        ),
      ),
    ]),
  ),
);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

const paint = (locator, pseudo = null) =>
  locator.evaluate((element, pseudoElement) => {
    const style = window.getComputedStyle(element, pseudoElement);
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      borderBottomColor: style.borderBottomColor,
      borderLeftColor: style.borderLeftColor,
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      boxShadow: style.boxShadow,
      opacity: style.opacity,
      transform: style.transform,
    };
  }, pseudo);

const rgba = (value) => {
  const channels = value.match(/[\d.]+/g)?.map(Number);
  if (!channels || channels.length < 3) throw new Error(`Not RGB: ${value}`);
  return [channels[0], channels[1], channels[2], channels[3] ?? 1];
};

const composite = (foreground, background) => {
  const [red, green, blue, alpha] = Array.isArray(foreground)
    ? foreground
    : rgba(foreground);
  return [
    red * alpha + background[0] * (1 - alpha),
    green * alpha + background[1] * (1 - alpha),
    blue * alpha + background[2] * (1 - alpha),
  ];
};

const luminance = (value) => {
  const linear = (Array.isArray(value) ? value : rgba(value).slice(0, 3)).map(
    (channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    },
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

const contrast = (foreground, background) => {
  const renderedBackground = Array.isArray(background)
    ? background
    : composite(background, [255, 255, 255]);
  const renderedForeground = composite(foreground, renderedBackground);
  const values = [
    luminance(renderedForeground),
    luminance(renderedBackground),
  ].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

const contrastThreshold = (fontSize, fontWeight) =>
  fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5;

const expectContrast = async (locator, label) => {
  const { color, backgrounds, fontSize, fontWeight } = await locator.evaluate(
    (element) => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const fontSize = Number.parseFloat(style.fontSize);
      const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
      const backgrounds = [];
      let node = element;
      while (node) {
        backgrounds.push(window.getComputedStyle(node).backgroundColor);
        node = node.parentElement;
      }
      return { color, backgrounds, fontSize, fontWeight };
    },
  );
  const backgroundColor = backgrounds
    .reverse()
    .reduce(
      (background, layer) => composite(layer, background),
      [255, 255, 255],
    );
  const minimum = contrastThreshold(fontSize, fontWeight);
  expect(
    contrast(color, backgroundColor),
    `${label}: ${color} on rgb(${backgroundColor.join(" ")})`,
  ).toBeGreaterThanOrEqual(minimum);
};

test("contrast guard applies normal and large-text thresholds", () => {
  expect(contrastThreshold(16, 400)).toBe(4.5);
  expect(contrastThreshold(24, 400)).toBe(3);
  expect(contrastThreshold(18.66, 700)).toBe(3);
  expect(contrast("rgba(0, 0, 0, 0.5)", "rgb(255, 255, 255)")).toBeCloseTo(
    3.95,
    1,
  );
});

const keyboardFocus = async (page, locator) => {
  await locator.evaluate((element) => {
    const sentinel = document.createElement("button");
    sentinel.type = "button";
    sentinel.dataset.wave35FocusSentinel = "";
    element.after(sentinel);
    sentinel.focus();
  });
  await page.keyboard.press("Shift+Tab");
  await expect(locator).toBeFocused();
  expect(
    await locator.evaluate((element) => element.matches(":focus-visible")),
  ).toBe(true);
  await page
    .locator("[data-wave35-focus-sentinel]")
    .evaluateAll((elements) => elements.forEach((element) => element.remove()));
};

const verifiedMaterialStates = new Map();

const verifyMaterialState = async (component, state, assertion) => {
  await assertion();
  const states = verifiedMaterialStates.get(component) ?? new Set();
  states.add(state);
  verifiedMaterialStates.set(component, states);
};

const verifyPaintState = (component, state, locator, expected, pseudo = null) =>
  verifyMaterialState(component, state, async () => {
    expect(await paint(locator, pseudo), `${component}:${state}`).toMatchObject(
      expected,
    );
  });

const expectMaterialStates = (component) => {
  expect(
    [...(verifiedMaterialStates.get(component) ?? [])].sort(),
    `wave35 material states: ${component}`,
  ).toEqual(
    [...manifests[component].interactionEvidence.materialStates].sort(),
  );
  verifiedMaterialStates.delete(component);
};

test("Input and Textarea bind real hover, focus-visible, invalid and disabled paint", async ({
  page,
}) => {
  for (const [name, locator] of [
    ["Input", page.locator("[data-workspace-search]")],
    [
      "Textarea",
      page.locator("[data-component-audit-id='textarea-default-empty']"),
    ],
  ]) {
    const control = locator.locator("xpath=..");
    await page.mouse.move(0, 0);
    expect(await paint(control), `${name} default`).toMatchObject({
      backgroundColor: "rgb(245, 245, 245)",
    });
    await verifyPaintState(name.toLowerCase(), "default", control, {
      backgroundColor: "rgb(245, 245, 245)",
    });
    await locator.fill("Interaction evidence");
    await locator.blur();
    await locator.hover();
    const realHoverPaint = await paint(control);
    expect(realHoverPaint, `${name} real hover`).toMatchObject({
      backgroundColor: "rgb(238, 240, 244)",
    });
    await verifyPaintState(name.toLowerCase(), "hover", control, {
      backgroundColor: "rgb(238, 240, 244)",
    });
    await expectContrast(locator, `${name} hover contrast`);
    const staticHoverControl =
      name === "Input"
        ? page
            .locator(
              "#input-demo .shlz-field--visual-hover .shlz-field__control",
            )
            .first()
        : page
            .locator("[data-component-audit-id='textarea-visual-hover-empty']")
            .locator("xpath=..");
    expect(realHoverPaint, `${name} static hover equivalence`).toMatchObject(
      await paint(staticHoverControl),
    );
    await keyboardFocus(page, locator);
    const realFocusPaint = await paint(control);
    expect(realFocusPaint, `${name} keyboard focus`).toMatchObject({
      backgroundColor: "rgb(238, 240, 244)",
      borderColor: "rgb(37, 61, 152)",
    });
    await verifyPaintState(name.toLowerCase(), "focus-visible", control, {
      backgroundColor: "rgb(238, 240, 244)",
      borderColor: "rgb(37, 61, 152)",
    });
    await expectContrast(locator, `${name} focus contrast`);
    const staticFocusControl =
      name === "Input"
        ? page
            .locator(
              "#input-demo .shlz-field--visual-focus .shlz-field__control",
            )
            .first()
        : page
            .locator("[data-component-audit-id='textarea-visual-focus-empty']")
            .locator("xpath=..");
    expect(realFocusPaint, `${name} static focus equivalence`).toMatchObject(
      await paint(staticFocusControl),
    );
  }

  const input = page.locator("[data-workspace-search]");
  const inputControl = input.locator("xpath=..");
  await input.evaluate((element) =>
    element.setAttribute("aria-invalid", "true"),
  );
  expect(await paint(inputControl), "Input invalid").toMatchObject({
    backgroundColor: "rgb(238, 240, 244)",
    borderColor: "rgb(204, 31, 31)",
  });
  await verifyPaintState("input", "invalid", inputControl, {
    backgroundColor: "rgb(238, 240, 244)",
    borderColor: "rgb(204, 31, 31)",
  });
  await input.evaluate((element) => {
    element.removeAttribute("aria-invalid");
    element.disabled = true;
  });
  await expect(input).toBeDisabled();
  await expect(inputControl).toHaveCSS("opacity", "0.5");
  await verifyPaintState("input", "disabled", inputControl, { opacity: "0.5" });

  const invalid = page.locator(
    "[data-component-audit-id='textarea-error-filled']",
  );
  expect(
    await paint(invalid.locator("xpath=parent::*")),
    "Textarea invalid",
  ).toMatchObject({
    backgroundColor: "rgb(238, 240, 244)",
    borderColor: "rgb(204, 31, 31)",
  });
  await verifyPaintState(
    "textarea",
    "invalid",
    invalid.locator("xpath=parent::*"),
    {
      backgroundColor: "rgb(238, 240, 244)",
      borderColor: "rgb(204, 31, 31)",
    },
  );
  const disabled = page.locator(
    "[data-component-audit-id='textarea-disabled-filled']",
  );
  await expect(disabled).toBeDisabled();
  await expect(disabled.locator("xpath=parent::*")).toHaveCSS("opacity", "0.5");
  await verifyPaintState(
    "textarea",
    "disabled",
    disabled.locator("xpath=parent::*"),
    {
      opacity: "0.5",
    },
  );
  expectMaterialStates("input");
  expectMaterialStates("textarea");
});

test("Select binds closed, hover, focus-visible, opened, option and disabled paint", async ({
  page,
}) => {
  const roots = page.locator(
    "#select-demo [data-select-production-fixtures] [data-shlz-select]",
  );
  const trigger = roots.first().locator(".shlz-select__trigger");
  await page.mouse.move(0, 0);
  await expect(trigger).toHaveCSS("background-color", "rgb(245, 245, 245)");
  await verifyPaintState("select", "closed-default", trigger, {
    backgroundColor: "rgb(245, 245, 245)",
  });
  await trigger.hover();
  await expect(trigger).toHaveCSS("background-color", "rgb(238, 240, 244)");
  await verifyPaintState("select", "hover", trigger, {
    backgroundColor: "rgb(238, 240, 244)",
  });
  const staticHoverPaint = await paint(
    page.locator(
      "[data-component-audit-id='request-status-hover'] .shlz-select__trigger",
    ),
  );
  expect(
    await paint(trigger),
    "Select static hover surface equivalence",
  ).toMatchObject({
    backgroundColor: staticHoverPaint.backgroundColor,
    borderColor: staticHoverPaint.borderColor,
  });
  await keyboardFocus(page, trigger);
  await expect(trigger).toHaveCSS("border-color", "rgb(37, 61, 152)");
  await verifyPaintState("select", "focus-visible", trigger, {
    borderColor: "rgb(37, 61, 152)",
  });
  const staticFocusPaint = await paint(
    page.locator(
      "[data-component-audit-id='request-status-focus'] .shlz-select__trigger",
    ),
  );
  expect(
    await paint(trigger),
    "Select static focus surface equivalence",
  ).toMatchObject({
    backgroundColor: staticFocusPaint.backgroundColor,
    borderColor: staticFocusPaint.borderColor,
    boxShadow: staticFocusPaint.boxShadow,
  });
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toHaveCSS("background-color", "rgb(238, 240, 244)");
  await verifyPaintState("select", "opened", trigger, {
    backgroundColor: "rgb(238, 240, 244)",
  });
  const option = roots.first().locator(".shlz-select__option").first();
  await option.hover();
  await expect(option).toHaveCSS("background-color", "rgb(238, 240, 244)");
  await verifyPaintState("select", "option-hover", option, {
    backgroundColor: "rgb(238, 240, 244)",
  });
  const selected = roots
    .filter({ has: page.locator('[role="option"][aria-selected="true"]') })
    .first()
    .locator('[role="option"][aria-selected="true"]');
  await expect(selected).toHaveCSS("background-color", "rgb(238, 240, 244)");
  await verifyPaintState("select", "option-selected", selected, {
    backgroundColor: "rgb(238, 240, 244)",
  });
  await expectContrast(option, "Select option hover contrast");
  await expectContrast(selected, "Select selected option contrast");
  const disabled = roots.locator(".shlz-select__trigger:disabled").first();
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveCSS("color", "rgba(11, 22, 35, 0.1)");
  await expect(disabled).toHaveCSS("cursor", "not-allowed");
  await verifyPaintState("select", "disabled", disabled, {
    color: "rgba(11, 22, 35, 0.1)",
  });
  const selectedTrigger = roots.nth(1).locator(".shlz-select__trigger");
  await selectedTrigger.hover();
  await expectContrast(selectedTrigger, "Select filled hover contrast");
  await keyboardFocus(page, selectedTrigger);
  await expectContrast(selectedTrigger, "Select filled focus contrast");
  expectMaterialStates("select");
});

test("Checkbox and Radio bind real checked, mixed, focus and disabled paint", async ({
  page,
}) => {
  const checkbox = page.locator(
    "[data-component-audit-id='checkbox-medium-default']",
  );
  const defaultPaint = await paint(checkbox);
  expect(defaultPaint, "Checkbox unchecked source paint").toMatchObject({
    backgroundColor: "rgb(255, 255, 255)",
    borderColor: "rgb(209, 216, 223)",
  });
  await verifyPaintState("checkbox", "unchecked", checkbox, {
    backgroundColor: "rgb(255, 255, 255)",
    borderColor: "rgb(209, 216, 223)",
  });
  await checkbox.hover();
  expect(
    await paint(checkbox),
    "Checkbox real hover is source-unknown and neutral",
  ).toMatchObject(defaultPaint);
  await checkbox.check();
  expect(await paint(checkbox), "Checkbox checked").toMatchObject({
    backgroundColor: "rgb(37, 61, 152)",
    borderColor: "rgb(37, 61, 152)",
  });
  await verifyPaintState("checkbox", "checked", checkbox, {
    backgroundColor: "rgb(37, 61, 152)",
    borderColor: "rgb(37, 61, 152)",
  });
  expect(
    await paint(checkbox, "::before"),
    "Checkbox check paint",
  ).toMatchObject({
    borderBottomColor: "rgb(255, 255, 255)",
    borderLeftColor: "rgb(255, 255, 255)",
  });
  await keyboardFocus(page, checkbox);
  expect(await paint(checkbox), "Checkbox focus-visible").toMatchObject({
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  await verifyPaintState("checkbox", "focus-visible", checkbox, {
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  const mixed = page.locator(
    "[data-component-audit-id='checkbox-medium-mixed']",
  );
  await expect(mixed).toHaveJSProperty("indeterminate", true);
  await expect(mixed).toHaveCSS("background-color", "rgb(37, 61, 152)");
  await verifyPaintState("checkbox", "indeterminate", mixed, {
    backgroundColor: "rgb(37, 61, 152)",
  });
  expect(await paint(mixed, "::before"), "Checkbox mixed mark").toMatchObject({
    borderBottomColor: "rgb(255, 255, 255)",
  });
  const disabledCheckbox = page.locator(
    "[data-component-audit-id='checkbox-medium-disabled']",
  );
  await expect(disabledCheckbox).toHaveCSS(
    "background-color",
    "rgb(115, 131, 190)",
  );
  await disabledCheckbox.evaluate((element) => {
    element.checked = false;
  });
  await expect(disabledCheckbox).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(disabledCheckbox).toHaveCSS(
    "border-color",
    "rgb(238, 240, 244)",
  );
  await verifyPaintState("checkbox", "disabled-unchecked", disabledCheckbox, {
    backgroundColor: "rgb(255, 255, 255)",
    borderColor: "rgb(238, 240, 244)",
  });
  await disabledCheckbox.evaluate((element) => {
    element.checked = true;
  });
  await verifyPaintState("checkbox", "disabled-checked", disabledCheckbox, {
    backgroundColor: "rgb(115, 131, 190)",
    borderColor: "rgb(115, 131, 190)",
  });

  const first = page.locator(
    "[data-component-audit-id='radio-framework-primary']",
  );
  const second = page.locator(
    "[data-component-audit-id='radio-framework-secondary']",
  );
  await expect(first).toBeChecked();
  await expect(first).toHaveCSS("border-color", "rgb(37, 61, 152)");
  await verifyPaintState("radio", "checked", first, {
    borderColor: "rgb(37, 61, 152)",
  });
  expect(await paint(first, "::before"), "Radio dot paint").toMatchObject({
    backgroundColor: "rgb(37, 61, 152)",
    transform: "matrix(1, 0, 0, 1, 0, 0)",
  });
  const radioDefault = await paint(second);
  expect(radioDefault, "Radio unchecked source paint").toMatchObject({
    backgroundColor: "rgb(255, 255, 255)",
    borderColor: "rgb(209, 216, 223)",
  });
  await verifyPaintState("radio", "unchecked", second, {
    backgroundColor: "rgb(255, 255, 255)",
    borderColor: "rgb(209, 216, 223)",
  });
  await second.hover();
  expect(
    await paint(second),
    "Radio real hover is source-unknown and neutral",
  ).toMatchObject(radioDefault);
  await keyboardFocus(page, first);
  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();
  expect(
    await second.evaluate((element) => element.matches(":focus-visible")),
  ).toBe(true);
  expect(await paint(second), "Radio focus-visible").toMatchObject({
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  await verifyPaintState("radio", "focus-visible", second, {
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  await second.evaluate((element) => {
    element.checked = false;
    element.disabled = true;
  });
  await expect(second).toHaveCSS("border-color", "rgb(238, 240, 244)");
  await verifyPaintState("radio", "disabled-unchecked", second, {
    borderColor: "rgb(238, 240, 244)",
  });
  await second.evaluate((element) => {
    element.checked = true;
  });
  await expect(second).toHaveCSS("border-color", "rgb(115, 131, 190)");
  await expect(second, "disabled checked Radio dot").toHaveCSS(
    "border-color",
    "rgb(115, 131, 190)",
  );
  expect(
    await paint(second, "::before"),
    "disabled checked Radio dot paint",
  ).toMatchObject({
    backgroundColor: "rgb(115, 131, 190)",
    transform: "matrix(1, 0, 0, 1, 0, 0)",
  });
  await verifyPaintState("radio", "disabled-checked", second, {
    borderColor: "rgb(115, 131, 190)",
  });
  expectMaterialStates("checkbox");
  expectMaterialStates("radio");
});

test("Switch binds real off/on, focus-visible and disabled off/on paint", async ({
  page,
}) => {
  const toggle = page.locator(
    "[data-component-audit-id='switch-framework-composition']",
  );
  await expect(toggle).not.toBeChecked();
  await expect(toggle).toHaveCSS("background-color", "rgb(209, 216, 223)");
  const offThumb = await paint(toggle, "::before");
  expect(offThumb, "Switch off thumb source paint").toMatchObject({
    backgroundColor: "rgb(255, 255, 255)",
    transform: "none",
  });
  await verifyPaintState("switch", "off", toggle, {
    backgroundColor: "rgb(209, 216, 223)",
  });
  await toggle.hover();
  expect(
    await paint(toggle, "::before"),
    "Switch hover has no distinct source state",
  ).toMatchObject(offThumb);
  await toggle.check();
  await expect(toggle).toHaveCSS("background-color", "rgb(37, 61, 152)");
  await expect
    .poll(async () => (await paint(toggle, "::before")).transform)
    .toBe("matrix(1, 0, 0, 1, 18, 0)");
  expect(await paint(toggle, "::before"), "Switch on thumb").toMatchObject({
    backgroundColor: "rgb(255, 255, 255)",
    transform: "matrix(1, 0, 0, 1, 18, 0)",
  });
  await verifyPaintState("switch", "on", toggle, {
    backgroundColor: "rgb(37, 61, 152)",
  });
  await keyboardFocus(page, toggle);
  expect(await paint(toggle), "Switch focus-visible").toMatchObject({
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  await verifyPaintState("switch", "focus-visible", toggle, {
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  const disabled = page.locator(
    "[data-component-audit-id='switch-labelled-disabled']",
  );
  await expect(disabled).toHaveCSS("opacity", "0.4");
  await expect(disabled).not.toBeChecked();
  expect(await paint(disabled, "::before"), "disabled off thumb").toMatchObject(
    {
      backgroundColor: "rgb(255, 255, 255)",
      transform: "none",
    },
  );
  await verifyPaintState("switch", "disabled-off", disabled, {
    backgroundColor: "rgb(209, 216, 223)",
    opacity: "0.4",
  });
  await disabled.evaluate((element) => {
    element.checked = true;
  });
  await expect(disabled).toBeChecked();
  await expect(disabled).toHaveCSS("background-color", "rgb(37, 61, 152)");
  await expect(disabled).toHaveCSS("opacity", "0.4");
  expect(await paint(disabled, "::before"), "disabled on thumb").toMatchObject({
    backgroundColor: "rgb(255, 255, 255)",
    transform: "matrix(1, 0, 0, 1, 18, 0)",
  });
  await verifyPaintState("switch", "disabled-on", disabled, {
    backgroundColor: "rgb(37, 61, 152)",
    opacity: "0.4",
  });
  expectMaterialStates("switch");
});

test("Button real-state matrix and static equivalence retain safe active contrast", async ({
  page,
}) => {
  const matrix = page.locator("[data-shlz-button-source-matrix]");
  for (const [mode, { selector, states }] of Object.entries({
    primary: {
      selector: ".shlz-button--primary",
      states: [
        ["rgb(255, 255, 255)", "rgb(37, 61, 152)"],
        ["rgb(255, 255, 255)", "rgb(66, 91, 166)"],
        ["rgb(255, 255, 255)", "rgb(22, 39, 115)"],
        ["rgb(255, 255, 255)", "rgb(115, 131, 190)"],
      ],
    },
    secondary: {
      selector:
        ".shlz-button:not(.shlz-button--primary):not(.shlz-button--text)",
      states: [
        ["rgb(11, 22, 35)", "rgb(238, 240, 244)"],
        ["rgb(37, 61, 152)", "rgb(238, 240, 244)"],
        ["rgb(22, 39, 115)", "rgb(223, 226, 240)"],
        ["rgb(147, 156, 165)", "rgb(238, 240, 244)"],
      ],
    },
    text: {
      selector: ".shlz-button--text",
      states: [
        ["rgb(11, 22, 35)", "rgb(255, 255, 255)"],
        ["rgb(37, 61, 152)", "rgb(238, 240, 244)"],
        ["rgb(22, 39, 115)", "rgb(223, 226, 240)"],
        ["rgb(147, 156, 165)", "rgb(255, 255, 255)"],
      ],
    },
  })) {
    const fixtures = matrix.locator(selector);
    const live = fixtures.nth(0);
    expect(await paint(live), `${mode} exact default`).toMatchObject({
      color: states[0][0],
      backgroundColor: states[0][1],
    });
    await verifyPaintState("button", `${mode}-default`, live, {
      color: states[0][0],
      backgroundColor: states[0][1],
    });
    await expectContrast(live, `${mode} default contrast`);
    await live.hover();
    expect(await paint(live), `${mode} exact hover`).toMatchObject({
      color: states[1][0],
      backgroundColor: states[1][1],
    });
    await verifyPaintState("button", `${mode}-hover`, live, {
      color: states[1][0],
      backgroundColor: states[1][1],
    });
    await expectContrast(live, `${mode} hover contrast`);
    expect(await paint(live), `${mode} hover equivalence`).toMatchObject(
      await paint(fixtures.nth(1)),
    );
    await page.mouse.down();
    expect(await paint(live), `${mode} exact active`).toMatchObject({
      color: states[2][0],
      backgroundColor: states[2][1],
    });
    await verifyPaintState("button", `${mode}-active`, live, {
      color: states[2][0],
      backgroundColor: states[2][1],
    });
    expect(await paint(live), `${mode} active equivalence`).toMatchObject(
      await paint(fixtures.nth(2)),
    );
    await expectContrast(live, `${mode} active contrast`);
    await page.mouse.up();
    await keyboardFocus(page, live);
    expect(await paint(live), `${mode} focus-visible`).toMatchObject({
      outlineColor: "rgb(37, 61, 152)",
      outlineStyle: "solid",
    });
    await verifyPaintState("button", `${mode}-focus-visible`, live, {
      outlineColor: "rgb(37, 61, 152)",
      outlineStyle: "solid",
    });
    await expectContrast(live, `${mode} focus contrast`);
    await expect(fixtures.nth(3)).toBeDisabled();
    expect(
      await paint(fixtures.nth(3)),
      `${mode} exact disabled`,
    ).toMatchObject({
      color: states[3][0],
      backgroundColor: states[3][1],
    });
    await verifyPaintState("button", `${mode}-disabled`, fixtures.nth(3), {
      color: states[3][0],
      backgroundColor: states[3][1],
    });
  }
  expectMaterialStates("button");
});

test("Link binds real hover, active and focus to the four-state source contract", async ({
  page,
}) => {
  const links = page.locator("#link-demo .shlz-link");
  const live = links.filter({ has: page.locator("xpath=self::a") }).first();
  await expect(live).toHaveCSS("color", "rgb(37, 61, 152)");
  await verifyPaintState("link", "default", live, {
    color: "rgb(37, 61, 152)",
  });
  await expectContrast(live, "Link default contrast");
  await live.hover();
  await expect(live).toHaveCSS("color", "rgb(66, 91, 166)");
  await verifyPaintState("link", "hover", live, {
    color: "rgb(66, 91, 166)",
  });
  expect(await paint(live), "Link hover fixture equivalence").toMatchObject(
    await paint(page.locator("#link-demo .shlz-link--visual-hover").first()),
  );
  await expectContrast(live, "Link hover contrast");
  await page.mouse.down();
  await expect(live).toHaveCSS("color", "rgb(22, 39, 115)");
  await verifyPaintState("link", "active", live, {
    color: "rgb(22, 39, 115)",
  });
  expect(await paint(live), "Link active fixture equivalence").toMatchObject(
    await paint(page.locator("#link-demo .shlz-link--visual-pressed").first()),
  );
  await expectContrast(live, "Link active contrast");
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await keyboardFocus(page, live);
  expect(await paint(live), "Link focus-visible").toMatchObject({
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  await verifyPaintState("link", "focus-visible", live, {
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  await expectContrast(live, "Link focused contrast");
  const unavailable = page.locator("#link-demo .shlz-link--disabled");
  await expect(unavailable).toHaveCSS("color", "rgb(115, 131, 190)");
  await verifyPaintState("link", "unavailable-text", unavailable, {
    color: "rgb(115, 131, 190)",
  });
  expectMaterialStates("link");
});

test("Segment binds selected, unselected, focus-visible and disabled paint", async ({
  page,
}) => {
  const group = page.locator("#segment-demo .shlz-segment").first();
  const selected = group.getByRole("radio", { name: "День" });
  const unselected = group.getByRole("radio", { name: "Неделя" });
  const disabled = group.getByRole("radio", { name: "Год" });
  await expect(selected).toBeChecked();
  await expect(selected.locator("xpath=following-sibling::*[1]")).toHaveCSS(
    "color",
    "rgb(37, 61, 152)",
  );
  await verifyPaintState(
    "segment",
    "selected",
    selected.locator("xpath=following-sibling::*[1]"),
    {
      color: "rgb(37, 61, 152)",
      backgroundColor: "rgb(255, 255, 255)",
      boxShadow: "rgba(11, 22, 35, 0.1) 0px 4px 12px 0px",
    },
  );
  await expectContrast(
    selected.locator("xpath=following-sibling::*[1]"),
    "Segment selected contrast",
  );
  const unselectedLabel = unselected.locator("xpath=following-sibling::*[1]");
  const unselectedPaint = await paint(unselectedLabel);
  expect(unselectedPaint, "Segment unselected source paint").toMatchObject({
    color: "rgb(11, 22, 35)",
    backgroundColor: "rgba(0, 0, 0, 0)",
    boxShadow: "none",
  });
  await verifyPaintState("segment", "unselected", unselectedLabel, {
    color: "rgb(11, 22, 35)",
    backgroundColor: "rgba(0, 0, 0, 0)",
    boxShadow: "none",
  });
  await unselected.hover();
  expect(
    await paint(unselectedLabel),
    "Segment hover is not a supported distinct source state",
  ).toMatchObject(unselectedPaint);
  await keyboardFocus(page, selected);
  await page.keyboard.press("ArrowRight");
  await expect(unselected).toBeFocused();
  expect(
    await unselected.evaluate((element) => element.matches(":focus-visible")),
  ).toBe(true);
  expect(await paint(unselectedLabel), "Segment focus-visible").toMatchObject({
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  await verifyPaintState("segment", "focus-visible", unselectedLabel, {
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  await expect(disabled.locator("xpath=following-sibling::*[1]")).toHaveCSS(
    "opacity",
    "0.5",
  );
  await verifyPaintState(
    "segment",
    "disabled",
    disabled.locator("xpath=following-sibling::*[1]"),
    { opacity: "0.5" },
  );
  expectMaterialStates("segment");
});

test("Tabs real hover equals its static fixture and focus/disabled paint stay distinct", async ({
  page,
}) => {
  const root = page.locator("#tabs-demo [data-shlz-tabs]");
  const active = root.getByRole("tab", { name: "Первый" });
  const inactive = root.getByRole("tab", { name: "Второй" });
  const disabled = root.getByRole("tab", { name: "Disabled" });
  await expect(active).toHaveCSS("color", "rgb(11, 22, 35)");
  await expect(active).toHaveCSS("border-bottom-color", "rgb(37, 61, 152)");
  const staticPaint = await paint(inactive);
  await inactive.evaluate((element) =>
    element.classList.remove("shlz-tabs__tab--visual-hover"),
  );
  await inactive.hover();
  expect(
    await paint(inactive),
    "Tabs real/static hover equivalence",
  ).toMatchObject(staticPaint);
  await keyboardFocus(page, active);
  await page.keyboard.press("ArrowRight");
  await expect(inactive).toBeFocused();
  expect(
    await inactive.evaluate((element) => element.matches(":focus-visible")),
  ).toBe(true);
  expect(await paint(inactive), "Tabs focus-visible").toMatchObject({
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  await verifyPaintState("tabs", "focus-visible", inactive, {
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  const tabFamilies = [
    [
      "underline",
      page
        .locator(
          "#tabs-demo .shlz-tabs:not(.shlz-tabs--pill):not(.shlz-tabs--boxed)",
        )
        .first(),
      {
        color: "rgb(11, 22, 35)",
        backgroundColor: "rgba(0, 0, 0, 0)",
      },
      {
        color: "rgb(11, 22, 35)",
        backgroundColor: "rgba(0, 0, 0, 0)",
        borderBottomColor: "rgb(37, 61, 152)",
      },
      {
        color: "rgb(209, 216, 223)",
        backgroundColor: "rgba(0, 0, 0, 0)",
      },
    ],
    [
      "pill",
      page.locator("#tabs-demo .shlz-tabs--pill"),
      {
        color: "rgb(37, 61, 152)",
        backgroundColor: "rgba(0, 0, 0, 0)",
        borderColor: "rgb(209, 216, 223)",
      },
      {
        color: "rgb(37, 61, 152)",
        backgroundColor: "rgb(223, 226, 240)",
      },
      {
        color: "rgb(209, 216, 223)",
        backgroundColor: "rgba(0, 0, 0, 0)",
        borderColor: "rgb(245, 245, 245)",
      },
    ],
    [
      "boxed",
      page.locator("#tabs-demo .shlz-tabs--boxed"),
      {
        color: "rgb(66, 91, 166)",
        backgroundColor: "rgb(250, 250, 250)",
      },
      {
        color: "rgb(37, 61, 152)",
        backgroundColor: "rgb(255, 255, 255)",
      },
      {
        color: "rgb(209, 216, 223)",
        backgroundColor: "rgb(250, 250, 250)",
        borderColor: "rgb(240, 240, 240)",
      },
    ],
  ];
  for (const [
    family,
    tabs,
    hoverPaint,
    activePaint,
    disabledPaint,
  ] of tabFamilies) {
    const selectedTab = tabs.locator('[role="tab"][aria-selected="true"]');
    const unselectedTab = tabs
      .locator(
        '[role="tab"][aria-selected="false"]:not([aria-disabled="true"])',
      )
      .first();
    await verifyPaintState(
      "tabs",
      `${family}-active`,
      selectedTab,
      activePaint,
    );
    await expectContrast(selectedTab, "Tabs selected contrast");
    await unselectedTab.evaluate((element, familyName) => {
      if (element.classList.contains("shlz-tabs__tab--visual-hover")) return;
      const fixture = element.cloneNode(true);
      fixture.classList.add("shlz-tabs__tab--visual-hover");
      fixture.dataset.wave35TabsHover = familyName;
      fixture.removeAttribute("id");
      element.after(fixture);
    }, family);
    const staticHover = tabs.locator(`[data-wave35-tabs-hover="${family}"]`);
    await unselectedTab.hover();
    await verifyPaintState(
      "tabs",
      `${family}-hover`,
      unselectedTab,
      hoverPaint,
    );
    await expectContrast(unselectedTab, `${family} hover contrast`);
    if ((await staticHover.count()) > 0)
      expect(
        await paint(unselectedTab),
        `${family} real/static hover equivalence`,
      ).toMatchObject(await paint(staticHover));
    if (family !== "underline")
      await unselectedTab.evaluate((element, familyName) => {
        const fixture = element.cloneNode(true);
        fixture.removeAttribute("id");
        fixture.setAttribute("disabled", "");
        fixture.setAttribute("aria-disabled", "true");
        fixture.dataset.wave35TabsDisabled = familyName;
        element.after(fixture);
      }, family);
    const executableDisabled =
      family === "underline"
        ? disabled
        : tabs.locator(`[data-wave35-tabs-disabled="${family}"]`);
    await expect(executableDisabled).toBeDisabled();
    await verifyPaintState(
      "tabs",
      `${family}-disabled`,
      executableDisabled,
      disabledPaint,
    );
  }
  expectMaterialStates("tabs");
});

test("Pagination binds real page/direction hover, active, focus, current and boundaries", async ({
  page,
}) => {
  const nav = page
    .locator("#pagination-demo nav.shlz-pagination")
    .filter({ has: page.locator(".shlz-pagination__item--visual-hover") })
    .first();
  const live = nav
    .locator("a.shlz-pagination__item:not([data-wave35-pagination-pressed])")
    .filter({ hasText: "3" });
  const staticHover = nav.locator(".shlz-pagination__item--visual-hover");
  await live.evaluate((element) => {
    const fixture = element.cloneNode(true);
    fixture.classList.add("shlz-pagination__item--visual-pressed");
    fixture.dataset.wave35PaginationPressed = "";
    fixture.removeAttribute("href");
    element.after(fixture);
  });
  const staticPressed = nav.locator("[data-wave35-pagination-pressed]");
  expect(await paint(live), "Pagination default").toMatchObject({
    color: "rgb(147, 156, 165)",
    backgroundColor: "rgb(255, 255, 255)",
    borderColor: "rgb(209, 216, 223)",
  });
  await verifyPaintState("pagination", "page-default", live, {
    color: "rgb(147, 156, 165)",
    backgroundColor: "rgb(255, 255, 255)",
    borderColor: "rgb(209, 216, 223)",
  });
  const paginationDefaultPaint = await paint(live);
  expect(
    contrast(
      paginationDefaultPaint.color,
      paginationDefaultPaint.backgroundColor,
    ),
    "Pagination source Default contrast is a documented P3 deviation",
  ).toBeLessThan(4.5);
  await live.hover();
  expect(
    await paint(live),
    "Pagination real/static hover equivalence",
  ).toMatchObject(await paint(staticHover));
  await verifyPaintState("pagination", "page-hover", live, {
    color: "rgb(37, 61, 152)",
    backgroundColor: "rgb(255, 255, 255)",
    borderColor: "rgb(209, 216, 223)",
  });
  await page.mouse.down();
  expect(await paint(live), "Pagination real active").toMatchObject({
    color: "rgb(37, 61, 152)",
    backgroundColor: "rgb(223, 226, 240)",
    borderColor: "rgb(223, 226, 240)",
  });
  await verifyPaintState("pagination", "page-active", live, {
    color: "rgb(37, 61, 152)",
    backgroundColor: "rgb(223, 226, 240)",
    borderColor: "rgb(223, 226, 240)",
  });
  expect(
    await paint(live),
    "Pagination pressed fixture equivalence",
  ).toMatchObject(await paint(staticPressed));
  await expectContrast(live, "Pagination active contrast");
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await keyboardFocus(page, live);
  expect(await paint(live), "Pagination focus-visible").toMatchObject({
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  await verifyPaintState("pagination", "focus-visible", live, {
    outlineColor: "rgb(37, 61, 152)",
    outlineStyle: "solid",
  });
  expect(
    await paint(nav.locator('[aria-current="page"]')),
    "Pagination current",
  ).toMatchObject({
    color: "rgb(37, 61, 152)",
    backgroundColor: "rgb(223, 226, 240)",
    borderColor: "rgb(223, 226, 240)",
  });
  await verifyPaintState(
    "pagination",
    "current",
    nav.locator('[aria-current="page"]'),
    {
      color: "rgb(37, 61, 152)",
      backgroundColor: "rgb(223, 226, 240)",
      borderColor: "rgb(223, 226, 240)",
    },
  );
  expect(
    await paint(nav.locator(".shlz-pagination__item--disabled")),
    "Pagination disabled boundary",
  ).toMatchObject({
    color: "rgb(238, 240, 244)",
    backgroundColor: "rgb(255, 255, 255)",
    borderColor: "rgb(238, 240, 244)",
  });
  await verifyPaintState(
    "pagination",
    "disabled-boundary",
    nav.locator(".shlz-pagination__item--disabled"),
    {
      color: "rgb(238, 240, 244)",
      backgroundColor: "rgb(255, 255, 255)",
      borderColor: "rgb(238, 240, 244)",
    },
  );
  const previous = nav.locator(".shlz-pagination__item--disabled").first();
  await expect(previous).toHaveAttribute("aria-disabled", "true");
  const next = nav.getByRole("link", { name: "Следующая страница" });
  await next.evaluate((element) => {
    const fixture = element.cloneNode(true);
    fixture.classList.add("shlz-pagination__item--visual-hover");
    fixture.dataset.wave35PaginationDirectionHover = "";
    fixture.removeAttribute("href");
    element.after(fixture);
  });
  const staticNextHover = nav.locator(
    "[data-wave35-pagination-direction-hover]",
  );
  await next.hover();
  await expect(next).toHaveCSS("color", "rgb(37, 61, 152)");
  expect(
    await paint(next),
    "Pagination direction hover equivalence",
  ).toMatchObject(await paint(staticNextHover));
  await expectContrast(next, "Pagination Next hover contrast");
  await page.goto("/?page=2#pagination-demo");
  await verifyMaterialState("pagination", "previous-next-hover", async () => {
    for (const direction of ["Предыдущая страница", "Следующая страница"]) {
      const directionLink = page.getByRole("link", { name: direction }).first();
      await directionLink.hover();
      expect(
        await paint(directionLink),
        `${direction} real hover`,
      ).toMatchObject({
        color: "rgb(37, 61, 152)",
        backgroundColor: "rgb(255, 255, 255)",
        borderColor: "rgb(209, 216, 223)",
      });
      await expectContrast(directionLink, `${direction} hover contrast`);
    }
  });
  expectMaterialStates("pagination");
});
