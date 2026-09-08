// Compare the real thumb paint with the real track paint. Comparing either
// mask to a rounded CSS box would miss the fractional-position regression.
// Callers provide a padded white surface; the crop also contains the focus ring.
export async function paintedThumbOffset(page, control) {
  const box = await control.boundingBox();
  const clip = {
    x: Math.floor(box.x) - 6,
    y: Math.floor(box.y) - 6,
    width: Math.ceil(box.width) + 12,
    height: Math.ceil(box.height) + 12,
  };
  const original = await page.screenshot({ clip });
  await control.evaluate((element) => {
    element.dataset.alignmentHideThumb = "";
  });
  const track = await page.screenshot({ clip });
  await control.evaluate((element) => {
    delete element.dataset.alignmentHideThumb;
  });
  return page.evaluate(
    async ({ originalImage, trackImage }) => {
      const decode = async (data) => {
        const image = document.createElement("img");
        image.src = `data:image/png;base64,${data}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, canvas.width, canvas.height);
      };
      const [original, track] = await Promise.all([
        decode(originalImage),
        decode(trackImage),
      ]);
      let thumbMass = 0;
      let thumbMoment = 0;
      let trackMass = 0;
      let trackMoment = 0;
      for (let y = 0; y < track.height; y++) {
        for (let x = 0; x < track.width; x++) {
          const index = (y * track.width + x) * 4;
          let thumbWeight = 0;
          let trackWeight = 0;
          for (let channel = 0; channel < 3; channel++) {
            thumbWeight = Math.max(
              thumbWeight,
              Math.abs(
                original.data[index + channel] - track.data[index + channel],
              ),
            );
            trackWeight = Math.max(
              trackWeight,
              255 - track.data[index + channel],
            );
          }
          thumbMass += thumbWeight;
          thumbMoment += (y + 0.5) * thumbWeight;
          trackMass += trackWeight;
          trackMoment += (y + 0.5) * trackWeight;
        }
      }
      return {
        thumbMass,
        trackMass,
        offset:
          (thumbMoment / thumbMass - trackMoment / trackMass) /
          window.devicePixelRatio,
      };
    },
    {
      originalImage: original.toString("base64"),
      trackImage: track.toString("base64"),
    },
  );
}

export async function openAlignmentShowcase(page) {
  await page.goto("/?full=1");
  await page
    .locator(".shlz-history-timeline")
    .first()
    .waitFor({ state: "attached" });
  await page.evaluate(() => {
    for (const details of document.querySelectorAll("details"))
      details.open = true;
  });
  await page.evaluate(() => document.fonts.ready);
  if (process.env.SHLZ_ALIGNMENT_KNOWN_BAD_STYLE) {
    await page.addStyleTag({
      path: process.env.SHLZ_ALIGNMENT_KNOWN_BAD_STYLE,
    });
  }
}

export async function textLineGeometry(control) {
  return control.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const walker = document.createTreeWalker(
      element,
      window.NodeFilter.SHOW_TEXT,
    );
    const lines = [];
    let node;
    while ((node = walker.nextNode())) {
      if (
        !node.textContent.trim() ||
        node.parentElement.closest(".shlz-visually-hidden, svg")
      )
        continue;
      const range = document.createRange();
      range.selectNode(node);
      for (const line of range.getClientRects()) {
        if (line.width && line.height)
          lines.push({
            left: line.left - box.left,
            top: line.top - box.top,
            right: box.right - line.right,
            bottom: box.bottom - line.bottom,
            height: line.height,
            centerOffset: line.top + line.height / 2 - box.top - box.height / 2,
          });
      }
    }
    return { width: box.width, height: box.height, lines };
  });
}
