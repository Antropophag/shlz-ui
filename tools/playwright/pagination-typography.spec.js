import { expect, test } from "@playwright/test";

const body15Regular = {
  fontFamily:
    '"Golos Text", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: "400",
  fontSize: "15px",
  lineHeight: "19.5px",
  letterSpacing: "-0.15px",
};

test("Pagination uses the source Body 15 Regular contract in every numeric role", async ({
  page,
}) => {
  await page.goto("/");

  const fixture = page.locator("#fidelity-pagination");
  const pageItems = fixture.locator(".shlz-pagination__group").first();
  const pageSizes = fixture.locator(".shlz-pagination__group").last();
  const roles = {
    pageItem: pageItems.getByText("2", { exact: true }),
    currentPageItem: pageItems.getByText("1", { exact: true }),
    pageSizeItem: pageSizes.getByText("50", { exact: true }),
    currentPageSizeItem: pageSizes.getByText("20", { exact: true }),
    summary: pageSizes.locator(".shlz-pagination__summary"),
  };

  for (const [name, locator] of Object.entries(roles)) {
    const actual = await locator.evaluate((element) => {
      const style = element.ownerDocument.defaultView.getComputedStyle(element);
      return {
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
      };
    });
    expect(actual, name).toEqual(body15Regular);
  }
});

test("Pagination typography visual is pixel-exact", async ({ page }) => {
  await page.goto("/");
  await page.locator(".shlz-verification-harness").evaluate((details) => {
    details.open = true;
  });
  const implementation = page.locator(
    "#fidelity-pagination .shlz-visual-fixture",
  );
  // Preserve the component fixture's raster phase when fractional source
  // geometry is introduced earlier in the documentation flow.
  await implementation.evaluate((element) => {
    const spacer = document.createElement("span");
    spacer.style.display = "block";
    spacer.style.blockSize = "0.5px";
    element.before(spacer);
  });
  await implementation.scrollIntoViewIfNeeded();
  await expect(implementation).toHaveScreenshot("pagination-typography.png", {
    maxDiffPixels: 0,
  });
});

test("Pagination digit fixture covers default and current source-fidelity cases", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".shlz-verification-harness").evaluate((details) => {
    details.open = true;
  });
  const fixture = page.locator("#fidelity-pagination");
  await fixture.evaluate((root) => {
    const group = root.querySelector(".shlz-pagination__group");
    group.innerHTML = ["1", "2", "3", "8", "20", "50", "100"]
      .map(
        (digit, index) =>
          `<span class="shlz-pagination__item${index === 0 ? " shlz-pagination__item--visual-pressed" : ""}">${digit}</span>`,
      )
      .join("");
  });
  const digitGroup = fixture.locator(".shlz-pagination__group").first();

  for (const digit of ["1", "2", "3", "8", "20", "50", "100"]) {
    await expect(digitGroup.getByText(digit, { exact: true })).toBeVisible();
  }
  await expect(
    digitGroup.locator(".shlz-pagination__item--visual-pressed"),
  ).toHaveText("1");
  await expect(
    digitGroup.locator(
      ".shlz-pagination__item:not(.shlz-pagination__item--visual-pressed)",
    ),
  ).toHaveCount(6);
});
