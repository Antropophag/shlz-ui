import { expect } from "@playwright/test";
import { textContrastEvidence } from "./text-contrast.js";

// Independent literal expectations from the approved source/semantic contract.
export const statusPaints = {
  blue: ["rgb(37, 61, 152)", "rgba(37, 61, 152, 0.15)"],
  green: ["rgb(61, 105, 64)", "rgba(87, 150, 92, 0.15)"],
  "bright-green": ["rgb(27, 109, 45)", "rgba(37, 152, 62, 0.15)"],
  "source-blue": ["rgb(36, 91, 153)", "rgba(61, 136, 222, 0.15)"],
  orange: ["rgb(138, 82, 30)", "rgba(222, 117, 61, 0.15)"],
  purple: ["rgb(129, 49, 167)", "rgba(129, 49, 167, 0.15)"],
  cyan: ["rgb(46, 102, 125)", "rgba(65, 145, 179, 0.15)"],
  pink: ["rgb(144, 56, 142)", "rgba(169, 66, 167, 0.15)"],
  neutral: ["rgb(103, 109, 116)", "rgb(245, 245, 245)"],
};
export const emptyVariants = ["simple", "customize", "basic", "fluid"];
export const surfaces = {
  white: "#FFFFFF",
  "gray-50": "#F5F5F5",
  "blue-50": "#EEF0F4",
  page: "#F4F6F9",
};

export async function expectReadable(locator, label) {
  const evidence = await textContrastEvidence(locator);
  expect(
    evidence.ratio,
    `${label}: ${evidence.color} contrast`,
  ).toBeGreaterThanOrEqual(4.5);
  return evidence;
}

function memberMarkup(family, member) {
  if (family === "status")
    return `<span class="shlz-status ${member === "blue" ? "" : `shlz-status--${member}`}">Состояние</span>`;
  return `<section class="shlz-empty-state ${member === "fluid" ? "" : `shlz-empty-state--${member}`}"><h2 class="shlz-empty-state__title">Нет данных</h2><p class="shlz-empty-state__description">Измените условия</p></section>`;
}

async function expectMemberPaint(text, family, member) {
  if (family === "status") {
    await expect(text).toHaveCSS("color", statusPaints[member][0]);
    await expect(text).toHaveCSS("background-color", statusPaints[member][1]);
    await expect(text).toHaveCSS("min-height", "30px");
    return;
  }
  const primary = ["customize", "basic"].includes(member);
  await expect(text.first()).toHaveCSS(
    "color",
    primary ? "rgb(11, 22, 35)" : "rgba(11, 22, 35, 0.6)",
  );
  await expect(text.last()).toHaveCSS("color", "rgba(11, 22, 35, 0.6)");
}

export async function expectContrastMember(page, family, member) {
  expect(["status", "empty-state"]).toContain(family);
  const members =
    family === "status" ? Object.keys(statusPaints) : emptyVariants;
  expect(members).toContain(member);
  const markup = memberMarkup(family, member);
  await page.locator("body").evaluate(
    (body, { markup, surfaces }) => {
      body.querySelector("[data-contrast-probe]")?.remove();
      const probe = document.createElement("div");
      probe.dataset.contrastProbe = "";
      probe.innerHTML = Object.entries(surfaces)
        .map(
          ([name, paint]) =>
            `<div data-contrast-surface="${name}" style="background:${paint};padding:16px">${markup}</div>`,
        )
        .join("");
      body.append(probe);
    },
    { markup, surfaces },
  );
  const measurements = [];
  for (const name of Object.keys(surfaces)) {
    const root = page.locator(
      `[data-contrast-probe] [data-contrast-surface='${name}']`,
    );
    const text = root.locator(
      family === "status"
        ? ".shlz-status"
        : ".shlz-empty-state__title, .shlz-empty-state__description",
    );
    await expect(text).toHaveCount(family === "status" ? 1 : 2);
    for (const locator of await text.all())
      measurements.push(
        await expectReadable(locator, `${family}/${member}/${name}`),
      );
    await expectMemberPaint(text, family, member);
  }
  await page
    .locator("[data-contrast-probe]")
    .evaluate((element) => element.remove());
  return measurements;
}
